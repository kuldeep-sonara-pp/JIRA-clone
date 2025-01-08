import { createProjectSnapshot } from "../controller/projectSnapshorts.controller";
import Project from "../model/project.model";
import Task from "../model/task.model";
import { recordExists } from "./database";

export const finalizeProjectHandler = async (projectId: number, userId: number): Promise<{ message: string; statusCode: number } | null> => {
    try {
        // Check if the project exists
        const exists = await recordExists(Project, { id: projectId });
        if (!exists) {
            return { message: 'Project does not exist', statusCode: 404 }; // Not found
        }

        await createProjectSnapshot(projectId, userId);

        const currentDate = new Date();
        const oneWeekEarlier = new Date(currentDate);
        oneWeekEarlier.setDate(currentDate.getDate() - 7);

        await Task.update(
            {
                status: 'completed',
                endDate: currentDate,
                startDate: oneWeekEarlier,
            },
            { where: { projectId } }
        );

        // Update the project end date
        await Project.update(
            { endDate: currentDate },
            { where: { id: projectId } }
        );

        return null; // No error, success
    } catch (error) {
        // Log the error for debugging
        console.log(error);
        return { message: 'Internal server error', statusCode: 500 }; // Internal server error
    }
};
