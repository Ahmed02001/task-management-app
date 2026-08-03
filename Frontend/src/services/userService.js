import axiosInstance from "../api/axiosInstance";
export async function searchUserByEmail(email) {
  const response = await axiosInstance.get("/users/search", {
    params: { email },
  });
  return response.data.user;
}
