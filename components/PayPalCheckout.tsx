import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { bookingConfig } from '../config/booking';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutProps {
    amount: number;
    onSuccess: (details: any) => void;
    onError: (err: any) => void;
    metadata?: Record<string, any>;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({ amount, onSuccess, onError, metadata }) => {
    // If no client ID is provided, show a disabled state or error
    if (!bookingConfig.paypalClientId) {
        return (
            <div className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                PayPal is not configured. (Missing Client ID)
            </div>
        );
    }

    return (
        <div className="w-full z-10 relative">
            <PayPalScriptProvider options={{
                clientId: bookingConfig.paypalClientId,
                currency: "USD", // Change to GBP or relevant currency if needed, assuming USD for now or check config
                intent: "capture"
            }}>
                <PayPalButtons
                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "USD", // Should match provider currency
                                        value: amount.toString(),
                                    },
                                    description: "Kartcade Booking",
                                    custom_id: metadata ? JSON.stringify(metadata) : undefined
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            try {
                                const details = await actions.order.capture();
                                onSuccess(details);
                            } catch (error) {
                                onError(error);
                            }
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        onError(err);
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};

export default PayPalCheckout;
