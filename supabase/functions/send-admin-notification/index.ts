import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotification {
  type: "booking" | "promo_used";
  experienceName?: string;
  vendorName?: string;
  guestEmail?: string;
  date?: string;
  time?: string;
  guests?: number;
  totalAmount?: number;
  currency?: string;
  promoCode?: string;
  discountAmount?: number;
  originalAmount?: number;
}

const ADMIN_EMAIL = "admin@stackd.app"; // Change this to actual admin email

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: BookingNotification = await req.json();
    console.log("[ADMIN-NOTIFICATION] Received:", notification);

    let subject: string;
    let htmlContent: string;

    if (notification.type === "booking") {
      subject = `🎉 New Booking: ${notification.experienceName}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f97316; margin-bottom: 20px;">New Booking Received!</h1>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #1e293b;">${notification.experienceName}</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Vendor</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.vendorName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Guest Email</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.guestEmail || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Date</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Time</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Guests</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.guests}</td>
              </tr>
              ${notification.promoCode ? `
              <tr>
                <td style="padding: 8px 0; color: #16a34a;">Promo Code Used</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #16a34a;">${notification.promoCode} (-$${notification.discountAmount?.toFixed(2)})</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #e2e8f0;">
                <td style="padding: 12px 0; font-weight: 600; font-size: 18px;">Total</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #f97316;">$${notification.totalAmount?.toFixed(2)} ${notification.currency?.toUpperCase()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">This is an automated notification from Stackd.</p>
        </div>
      `;
    } else if (notification.type === "promo_used") {
      subject = `🏷️ Promo Code Used: ${notification.promoCode}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a; margin-bottom: 20px;">Promo Code Used!</h1>
          
          <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
            <h2 style="margin: 0 0 15px 0; color: #166534;">${notification.promoCode}</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Experience</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.experienceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Guest Email</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${notification.guestEmail || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Original Amount</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${notification.originalAmount?.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #16a34a;">Discount Applied</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #16a34a;">-$${notification.discountAmount?.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #bbf7d0;">
                <td style="padding: 12px 0; font-weight: 600; font-size: 18px;">Final Amount</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #f97316;">$${notification.totalAmount?.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">This is an automated notification from Stackd.</p>
        </div>
      `;
    } else {
      throw new Error("Unknown notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "Stackd <notifications@resend.dev>",
      to: [ADMIN_EMAIL],
      subject,
      html: htmlContent,
    });

    console.log("[ADMIN-NOTIFICATION] Email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[ADMIN-NOTIFICATION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
