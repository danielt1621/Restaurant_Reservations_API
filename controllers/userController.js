// backend/controllers/userController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const userController = {
    // Handler for user changing their own password
    async updateMyPassword(req, res) {
        const userId = req.user?.id; // Get user ID from authenticated token
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) { // adding lenght, why not?
             return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        try {
            // Fetch the current user data (including password hash)
            const user = await userModel.findById(userId);
            if (!user) {
                // Should not happen if token is valid, but good check
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify the current password
            const isMatch = await userModel.comparePassword(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect current password' });
            }

            // Hash the new password
            const newHashedPassword = await bcrypt.hash(newPassword, 10); // Using default salt rounds

            // Update the password in the database
            const affectedRows = await userModel.updatePassword(userId, newHashedPassword);

            if (affectedRows === 0) {
                // Should not happen if user was found
                 console.error(`Failed to update password for user ${userId} despite correct current password.`);
                return res.status(500).json({ message: 'Failed to update password' });
            }

            res.json({ message: 'Password updated successfully' });

        } catch (error) {
            console.error(`Error updating password for user ${userId}:`, error);
            res.status(500).json({ message: 'Internal server error updating password' });
        }
    },

    // Handler to get current user's profile info (excluding password)
    async getMyProfile(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
             // Use findById but exclude password from returned data
             const user = await userModel.findById(userId);
             if (!user) {
                 return res.status(404).json({ message: 'User profile not found' });
             }
             // Send back only safe information
             res.json({
                 id: user.user_id,
                 name: user.name,
                 email: user.email,
                 role: user.role
             });
        } catch(error) {
             console.error(`Error fetching profile for user ${userId}:`, error);
            res.status(500).json({ message: 'Internal server error fetching profile' });
        }
    },


    // Handler for user changing their own username
    async updateMyUsername(req, res) {
        const userId = req.user?.id; // Get user ID from authenticated token
        const {currentUsername, newUsername} = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!currentUsername || !newUsername) {
            return res.status(400).json({ message: 'Current username and new username are required' });
        }
        try{
            // Find user by ID
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
           
            // Check if new username is already taken
            const existingUser = await userModel.findByUsername(newUsername);// Use findByUsername method
            if (existingUser) {
                return res.status(409).json({ message: 'Username already taken' });
            }
            // Update the username in the database
            const affectedRows = await userModel.updateUsername(userId, newUsername);
            // Should not happen if user was found
            if (affectedRows === 0) {
                return res.status(500).json({ message: 'Failed to update username' });
            }

            res.json({message: 'Username updated successfully'});


        }catch (error) {
            console.error(`Error updating username for user ${userId}:`, error);
            res.status(500).json({message: 'Internal server error during updating username'});
        }

    }
};
 // problem if the user has changed their username and then they send a patch request with the old username, it will still work
module.exports = userController;