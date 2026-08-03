import { findUserByEmailService } from "../services/user.service.js";

export async function searchUserByEmailController(req, res, next) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email query parameter is required",
      });
    }

    const user = await findUserByEmailService(email);

    return res.status(200).json({ message: "success", user });
  } catch (error) {
    next(error);
  }
}
