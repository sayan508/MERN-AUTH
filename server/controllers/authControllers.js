import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

//register controller
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //sending email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'fuck you',
            text: `bhosdi wala bakchod email created ${email}`
        }
        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: 'User Registered Successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

//login controller

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'EMAIL AND PASSWORD ARE REQUIRED' })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid Email' })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: 'Login Successful' });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//logout controller

export const logout = async (req, res) => {

    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        });
        return res.json({ success: true, message: 'Logout Successful' });
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
// verify email

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId)
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "account already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000 // 10 minutes
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'account verification otp',
            text: `Your otp is ${otp}.Verify your acoount using this gudmarani otp`
        }
        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: 'verification otp is sent on the email id' })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}



export const verifyEmail = async (req, res) => {
    const userId = req.userId;   // ✅ from auth middleware
    const { otp } = req.body;    // ✅ from Postman

    if (!userId || !otp) {
        return res.json({
            success: false,
            message: "Missing details"
        });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Debug logging
        console.log('=== OTP Verification Debug ===');
        console.log('Received OTP:', otp, 'Type:', typeof otp, 'Length:', otp.length);
        console.log('Stored OTP:', user.verifyOtp, 'Type:', typeof user.verifyOtp, 'Length:', user.verifyOtp.length);

        // Convert both to strings and trim for comparison
        const storedOtp = String(user.verifyOtp).trim();
        const receivedOtp = String(otp).trim();

        console.log('After trim - Stored:', storedOtp, 'Received:', receivedOtp);
        console.log('Match:', storedOtp === receivedOtp);
        console.log('=============================');

        if (!storedOtp || storedOtp === '' || storedOtp !== receivedOtp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: "OTP is expired"
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// is autneticated

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//send pass reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "email is required" })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            res.json({ success: false, message: "user not found" })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 9 * 60 * 1000 // 10 minutes
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset otp otp',
            text: `ypour opt for resetting your password is ${otp}.use this otp to proceed with resetting your password`
        }
        await transporter.sendMail(mailOption)
        return res.json({ success: true, message: "password reset otp sent to your email " })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


//reset user password

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'email otp and new password is requored' })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "user not found" })
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: "invalid otp" })
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "otp expired" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: "password has been changed successfully" })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
