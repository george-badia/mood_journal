import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { JournalEntry, Mood } from '../types';

export interface ReportData {
  entries: JournalEntry[];
  dateRange: {
    start: string;
    end: string;
  };
  userProfile?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class PDFReportGenerator {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.pdf = new jsPDF();
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.margin = 20;
    this.currentY = this.margin;
  }

  private addNewPageIfNeeded(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(title: string, fontSize: number = 20): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += fontSize * 0.6;
  }

  private addSubtitle(subtitle: string, fontSize: number = 14): void {
    this.addNewPageIfNeeded(20);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(subtitle, this.margin, this.currentY);
    this.currentY += fontSize * 0.8;
  }

  private addText(text: string, fontSize: number = 12): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    const lineHeight = fontSize * 0.6;
    
    this.addNewPageIfNeeded(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += lineHeight;
    });
    this.currentY += 5; // Add some spacing after text
  }

  private getMoodStats(entries: JournalEntry[]): { [key in Mood]: number } {
    const stats = {
      [Mood.Awesome]: 0,
      [Mood.Good]: 0,
      [Mood.Okay]: 0,
      [Mood.Bad]: 0,
      [Mood.Terrible]: 0
    };

    entries.forEach(entry => {
      stats[entry.mood]++;
    });

    return stats;
  }

  private getTopEmotions(entries: JournalEntry[]): Array<{ emotion: string; count: number }> {
    const emotionCounts: { [key: string]: number } = {};

    entries.forEach(entry => {
      if (entry.analysis?.emotions) {
        entry.analysis.emotions.forEach(emotion => {
          emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
        });
      }
    });

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private addMoodDistribution(entries: JournalEntry[]): void {
    this.addSubtitle('Mood Distribution');
    
    const stats = this.getMoodStats(entries);
    const total = entries.length;

    Object.entries(stats).forEach(([mood, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      this.addText(`${mood}: ${count} entries (${percentage}%)`);
    });
  }

  private addTopEmotions(entries: JournalEntry[]): void {
    this.addSubtitle('Most Common Emotions');
    
    const topEmotions = this.getTopEmotions(entries);
    
    if (topEmotions.length === 0) {
      this.addText('No emotion data available.');
      return;
    }

    topEmotions.forEach(({ emotion, count }) => {
      this.addText(`${emotion}: ${count} occurrences`);
    });
  }

  private addJournalEntries(entries: JournalEntry[]): void {
    this.addSubtitle('Journal Entries');
    
    if (entries.length === 0) {
      this.addText('No journal entries found for this period.');
      return;
    }

    entries.slice(0, 20).forEach((entry, index) => {
      this.addNewPageIfNeeded(40);
      
      // Entry header
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(`Entry ${index + 1} - ${new Date(entry.date).toLocaleDateString()}`, this.margin, this.currentY);
      this.currentY += 15;
      
      // Mood
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`Mood: ${entry.mood}`, this.margin, this.currentY);
      this.currentY += 12;
      
      // Entry text
      this.addText(entry.text, 10);
      
      // Analysis summary if available
      if (entry.analysis?.summary) {
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setFontSize(10);
        this.addText(`AI Analysis: ${entry.analysis.summary}`);
      }
      
      this.currentY += 10; // Space between entries
    });

    if (entries.length > 20) {
      this.addText(`... and ${entries.length - 20} more entries.`);
    }
  }

  public async generateReport(data: ReportData): Promise<void> {
    try {
      // Header
      this.addTitle('Mood Journal Report');
      this.currentY += 10;

      // User info
      if (data.userProfile) {
        this.addText(`Generated for: ${data.userProfile.firstName} ${data.userProfile.lastName}`);
        this.addText(`Email: ${data.userProfile.email}`);
      }
      
      this.addText(`Report Period: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}`);
      this.addText(`Generated on: ${new Date().toLocaleDateString()}`);
      this.addText(`Total Entries: ${data.entries.length}`);
      this.currentY += 20;

      // Summary
      this.addSubtitle('Summary');
      if (data.entries.length > 0) {
        const avgMoodScore = this.calculateAverageMoodScore(data.entries);
        this.addText(`Average mood score: ${avgMoodScore.toFixed(1)}/5`);
        this.addText(`Most frequent mood: ${this.getMostFrequentMood(data.entries)}`);
      } else {
        this.addText('No entries found for this period.');
      }
      this.currentY += 15;

      // Mood distribution
      this.addMoodDistribution(data.entries);
      this.currentY += 15;

      // Top emotions
      this.addTopEmotions(data.entries);
      this.currentY += 15;

      // Journal entries
      this.addJournalEntries(data.entries);

      // Footer
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text('Generated by MoodFlow AI - Confidential Report', this.margin, this.pageHeight - 10);

      // Save the PDF
      const fileName = `mood-report-${new Date().toISOString().split('T')[0]}.pdf`;
      this.pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }

  private calculateAverageMoodScore(entries: JournalEntry[]): number {
    const moodScores = {
      [Mood.Terrible]: 1,
      [Mood.Bad]: 2,
      [Mood.Okay]: 3,
      [Mood.Good]: 4,
      [Mood.Awesome]: 5
    };

    const totalScore = entries.reduce((sum, entry) => sum + moodScores[entry.mood], 0);
    return totalScore / entries.length;
  }

  private getMostFrequentMood(entries: JournalEntry[]): string {
    const stats = this.getMoodStats(entries);
    return Object.entries(stats).reduce((a, b) => stats[a[0] as Mood] > stats[b[0] as Mood] ? a : b)[0];
  }
}

export const generatePDFReport = async (data: ReportData): Promise<void> => {
  const generator = new PDFReportGenerator();
  await generator.generateReport(data);
};