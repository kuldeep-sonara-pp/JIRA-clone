import { Request, Response } from "express";
import { findFromToken } from "../util/auth.middleware";
import { Op } from "sequelize";
import { globalPaginate, paginate } from "../util/paginate";
import User from "../model/user.model";
import Team from "../model/team.model";
import Project from "../model/project.model";
import Task from "../model/task.model";
import { parse } from "url";

export const globalSearch = async (req: Request, res: Response) => {
    const token = req.cookies.token;

    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'manager') {
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }

        const queryString = parse(req.url, true).query;
        const query = Object.keys(queryString)[0];

        console.log("Extracted query:", query);
        if (!query || typeof query !== "string") {
            res.status(400).json({ message: "Search query is required" });
            return; 
        }

        const searchQuery = query;
        console.log("Final search query:", searchQuery);

        // Define search options for each model
        const userSearchOptions = {
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { email: { [Op.like]: `%${searchQuery}%` } }
                ]
            }
        };

        const projectSearchOptions = {
            where: {
                [Op.or]: [
                    { projectName: { [Op.like]: `%${searchQuery}%` } },
                    { projectDescription: { [Op.like]: `%${searchQuery}%` } }
                ]
            }
        };

        const taskSearchOptions = {
            where: {
                [Op.or]: [
                    { taskName: { [Op.like]: `%${searchQuery}%` } },
                    { taskDescription: { [Op.like]: `%${searchQuery}%` } }
                ]
            }
        };

        const teamSearchOptions = {
            where: {
                [Op.or]: [
                    { teamName: { [Op.like]: `%${searchQuery}%` } }
                ]
            }
        };

        // Execute searches concurrently
        const [userResults, projectResults, taskResults, teamResults] = await Promise.all([
            globalPaginate(User, userSearchOptions, req),
            globalPaginate(Project, projectSearchOptions, req),
            globalPaginate(Task, taskSearchOptions, req),
            globalPaginate(Team, teamSearchOptions, req)
        ]);

        // Create results object and only include non-empty results
        const results: any = {};
        if (userResults.totalCount > 0) results.users = userResults;
        if (projectResults.totalCount > 0) results.projects = projectResults;
        if (taskResults.totalCount > 0) results.tasks = taskResults;
        if (teamResults.totalCount > 0) results.teams = teamResults;

        // If no results were found in any table
        if (Object.keys(results).length === 0) {
            res.status(404).json({ message: "No data found for the given query." });
            return ;
        }

        // Return the results
        res.status(200).json(results);
        return;
    } catch (error) {
        console.error("Global search error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        res.status(500).json({ message: errorMessage });
    }
};
