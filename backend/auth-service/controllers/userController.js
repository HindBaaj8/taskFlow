const User = require("../models/User");


// 🔹 GET ALL USERS + SEARCH
const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search;

    let query = {};

    if (keyword) {
      query = {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { role: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User non trouvé" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User non trouvé" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User non trouvé" });
    }

    await user.deleteOne();

    res.json({ message: "User supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 BLOCK USER
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User non trouvé" });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User bloqué" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 UNBLOCK USER
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User non trouvé" });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User débloqué" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
};