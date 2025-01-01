"use strict";
// import { Request, Response } from 'express';
// import { findFromToken } from '../util/auth.middleware';
// import Task from '../model/task.model';
// import { useInflection } from 'sequelize';
// export const createTask = async (req: Request, res: Response) => {
//     try {
//         const token = req.cookies.token;
//         const decodedToken = findFromToken(token);
//         if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         const { projectId, taskName, taskDescription, startDate, endDate, assignedTo, status } = req.body;
//         const newTask = await Task.create({
//             projectId,
//             taskName,
//             taskDescription,
//             startDate: startDate || null,
//             endDate: endDate || null,
//             assignedTo: assignedTo || null,
//             createdBy: decodedToken.userId,
//             status: status || "To Do"
//         });
//         return res.status(200).json({ newTask });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'An error occurred while creating the task.' });
//     }
// };
// export const getTaskByProject = async (req: Request, res: Response) => {
// }
