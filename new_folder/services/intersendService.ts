
/**
 * Simulates a payment request to InterSend's M-Pesa API.
 * In a real application, this would make an actual HTTP request.
 * @param phoneNumber The user's M-Pesa phone number.
 * @param amount The amount to be charged.
 * @returns A promise that resolves on successful payment simulation.
 */
export const processMpesaPayment = (phoneNumber: string, amount: number): Promise<{ transactionId: string }> => {
  return new Promise((resolve, reject) => {
    console.log(`Initiating M-Pesa payment for ${phoneNumber} of KES ${amount}...`);

    // Basic validation for a Kenyan phone number
    if (!phoneNumber.match(/^(?:\+?254|0)?(7\d{8})$/)) {
        setTimeout(() => reject(new Error("Invalid Kenyan phone number format. Use e.g., 0712345678.")), 500);
        return;
    }

    if (amount <= 0) {
        setTimeout(() => reject(new Error("Payment amount must be positive.")), 500);
        return;
    }

    // Simulate network delay and API processing
    setTimeout(() => {
        // Simulate a successful transaction
        const success = true; // Change to false to test error case
        if (success) {
            const transactionId = `MPESA_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            console.log(`Payment successful. Transaction ID: ${transactionId}`);
            resolve({ transactionId });
        } else {
            console.error("M-Pesa payment failed.");
            reject(new Error("The payment could not be processed. Please try again."));
        }
    }, 2500);
  });
};