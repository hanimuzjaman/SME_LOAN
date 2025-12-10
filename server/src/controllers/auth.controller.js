import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import EmployeeCredential from "../models/EmployeeCredential.js";
import ApplicantInfo from "../models/ApplicantInfo.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// POST /api/auth/register
export const register = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: "Email and password required" });

		const existing = await User.findOne({ email: email.toLowerCase().trim() });
		if (existing) return res.status(409).json({ message: "User already exists" });

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const user = await User.create({ email: email.toLowerCase().trim(), password: hash });

		return res.status(201).json({ success: true, user: { id: user._id, email: user.email } });
	} catch (err) {
		console.error("register error:", err);
		return res.status(500).json({ message: "Server error" });
	}
};

// POST /api/auth/login
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: "Email and password required" });

		const user = await User.findOne({ email: email.toLowerCase().trim() });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(401).json({ message: "Invalid credentials" });

			// create token
			const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

			// if user has linked applicant id, return it; otherwise try to find by email in ApplicantInfo
			let applicantId = user.applicantId || null;
			if (!applicantId) {
				try {
					const found = await ApplicantInfo.findOne({ email: user.email.toLowerCase().trim() }).lean();
					if (found && found.Applicant_ID) {
						applicantId = found.Applicant_ID;
						// persist linkage for faster future logins
						try {
							await User.findByIdAndUpdate(user._id, { applicantId }, { new: true }).catch(() => {});
						} catch (e) {
							// ignore persistence errors
						}
					}
				} catch (e) {
					// ignore lookup errors
				}
			}

			return res.json({ success: true, token, user: { id: user._id, email: user.email }, applicantId });
	} catch (err) {
		console.error("login error:", err);
		return res.status(500).json({ message: "Server error" });
	}
};

// POST /api/auth/employee/login
export const employeeLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: "Email and password required" });

		const employee = await EmployeeCredential.findOne({ email: email.toLowerCase().trim() });
		if (!employee) return res.status(401).json({ message: "Invalid employee credentials" });

			// Accept hashed password comparison. If stored password is plain text (legacy), allow exact match as fallback.
			const stored = employee.password || employee.password_placeholder || "";
			let match = false;
			try {
				match = await bcrypt.compare(password, stored);
			} catch (e) {
				match = false;
			}
			const fallback = stored === password;
			if (!match && !fallback) return res.status(401).json({ message: "Invalid employee credentials" });

		// create token for employee
		const token = jwt.sign({ email: employee.email, role: employee.role }, JWT_SECRET, { expiresIn: "7d" });

		return res.json({ success: true, token, employee: { employee_id: employee.employee_id, email: employee.email, name: employee.name } });
	} catch (err) {
		console.error("employeeLogin error:", err);
		return res.status(500).json({ message: "Server error" });
	}
};

// GET /api/auth/profile
export const profile = async (req, res) => {
	try {
		const payload = req.user || {};
		if (!payload.userId && !payload.email) return res.status(400).json({ message: "Invalid token payload" });

		const user = await User.findById(payload.userId).lean().catch(() => null);
		if (!user) {
			// fallback: find by email
			const byEmail = await User.findOne({ email: payload.email }).lean().catch(() => null);
			if (!byEmail) return res.status(404).json({ message: "User not found" });
			return res.json({ user: { id: byEmail._id, email: byEmail.email }, applicantId: byEmail.applicantId || null });
		}

		return res.json({ user: { id: user._id, email: user.email }, applicantId: user.applicantId || null });
	} catch (err) {
		console.error("profile error:", err);
		return res.status(500).json({ message: "Server error" });
	}
};

export default {
	register,
	login,
	employeeLogin,
};
