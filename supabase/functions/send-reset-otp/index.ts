import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user exists with this email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error checking user:", userError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, an OTP has been generated." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userExists = userData.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      // Don't reveal if user exists or not
      console.log("User not found for email:", email);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, an OTP has been generated." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up expired OTPs first
    await supabaseAdmin.rpc('cleanup_expired_otps');

    // Delete any existing OTPs for this email
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('email', email.toLowerCase());

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP generated for ${email}: ${otpCode}`);

    // For development, return the OTP directly
    // In production, this would send an email instead
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your email",
        // DEVELOPMENT ONLY - remove in production
        dev_otp: otpCode 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
