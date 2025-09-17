const { PrismaClient } = require('@prisma/client');
const nodeCrypto = require('crypto');
const { Resend } = require('resend');
const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInvitationEmail = async (email, token) => {
    const frontendUrl = 'http://localhost:5173';
    const registrationLink = `${frontendUrl}/vendor-register?token=${token}`;

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "You're Invited to Join RecyGlo as a Vendor!",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #2e8b57;">Hello!</h2>
                        <p>You have been invited to join the <strong>RecyGlo</strong> platform as a registered vendor.</p>
                        <p>To complete your registration, please click the link below:</p>
                        <p style="text-align: center;">
                            <a href="${registrationLink}" style="background-color: #2e8b57; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Complete Your Registration</a>
                        </p>
                        <p>This invitation link will expire in 72 hours.</p>
                    </div>
                </div>
            `,
        });
        console.log(`Resend invitation email successfully queued for ${email}`);
    } catch (error) {
        console.error(`Failed to send invitation email to ${email}:`, error);
        // In a real production app, you might add this to a retry queue.
    }
};

const sendInvitation = async (req, res) => {
    const { email } = req.body;
    const invitedByUserId = req.user.id;

    if (!email) { return res.status(400).json({ message: "Email is required." }); }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) { return res.status(400).json({ message: "A user with this email already exists." }); }

        const existingInvitation = await prisma.vendorInvitation.findFirst({ where: { email, status: 'PENDING' } });
        if (existingInvitation) { return res.status(400).json({ message: "An invitation has already been sent to this email." }); }

        const token = nodeCrypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        await prisma.vendorInvitation.create({
            data: { email, token, expiresAt, invitedByUserId }
        });
        
        // --- THE FIX ---
        // 1. Respond to the user immediately.
        res.status(201).json({ message: `Invitation sent successfully to ${email}.` });

        // 2. Send the email in the background *after* responding.
        // We don't use 'await' here, so the function doesn't wait.
        sendInvitationEmail(email, token);

    } catch (error) {
        console.error("Error in sendInvitation controller:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const verifyInvitation = async (req, res) => {
    const { token } = req.params;
    try {
        const invitation = await prisma.vendorInvitation.findUnique({ where: { token } });
        if (!invitation || invitation.status !== 'PENDING' || new Date() > new Date(invitation.expiresAt)) {
            return res.status(404).json({ message: "Invitation not found or has expired." });
        }
        res.status(200).json({ email: invitation.email });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    sendInvitation,
    verifyInvitation,
};

