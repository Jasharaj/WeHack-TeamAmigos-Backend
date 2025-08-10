import Reminder from '../models/ReminderSchema.js';

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, dueDate, priority, caseId, caseName } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    const reminder = new Reminder({
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      userId,
      userModel: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
      caseId: caseId || null,
      caseName
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create reminder'
    });
  }
};

// Get all reminders for user
export const getReminders = async (req, res) => {
  try {
    const userId = req.userId;
    const { completed } = req.query;

    let filter = { userId };
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const reminders = await Reminder.find(filter)
      .populate('caseId', 'title')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Reminders fetched successfully',
      data: reminders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
};

// Get reminder by ID
export const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reminder = await Reminder.findOne({ 
      _id: id, 
      userId 
    }).populate('caseId', 'title');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder fetched successfully',
      data: reminder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder'
    });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, completed, caseId, caseName } = req.body;
    const userId = req.userId;

    const updateData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      caseId: caseId || null,
      caseName,
      updatedAt: new Date()
    };

    // Handle completion status
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    ).populate('caseId', 'title');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder'
    });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reminder = await Reminder.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder'
    });
  }
};

// Toggle reminder completion
export const toggleReminderCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.completed = !reminder.completed;
    reminder.completedAt = reminder.completed ? new Date() : null;
    reminder.updatedAt = new Date();

    await reminder.save();

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('caseId', 'title');

    res.status(200).json({
      success: true,
      message: `Reminder ${reminder.completed ? 'completed' : 'reopened'} successfully`,
      data: populatedReminder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder'
    });
  }
};
