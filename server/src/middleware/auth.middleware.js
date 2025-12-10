import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Verifies JWT and attaches payload to req.user
export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing or invalid Authorization header" });
  const token = auth.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Ensures the token bearer has role 'employee'
export function requireEmployee(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role && req.user.role === "employee") return next();
  return res.status(403).json({ message: "Forbidden: employee access only" });
}

export default { verifyToken, requireEmployee };
