import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  console.log("Auth Middleware Invoked..");
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log(token);
  if (!token) return res.status(401).json({ msg: "No token, unauthorized" });
  try {
    console.log("Verifying Token..");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (err) {
    res.status(403).json({ msg: "Invalid token" });
  }
};
