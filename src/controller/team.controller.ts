
import Team from "../model/team.model";
import { Request, Response } from 'express';
import User from "../model/user.model";
import Roles from "../model/rols.model";
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";

export const createTeam = async (req: Request, res: Response) : Promise<void> => {
    
    const { teamName, teamLeadId } = req.body;
    console.log("teamName :", teamName);
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }
        const teamLeadExists = await recordExists(User, teamLeadId);
        if (!teamLeadExists) {
            res.status(404).json({ message: 'Team lead not found' });
            return; 
        }
        const teamExists = await recordExists(Team, { teamName : teamName, teamLeadId: teamLeadId });
        if (teamExists) {
            res.status(409).json({ message: 'Team is alrady exist' });
            return; 
        }

        const teamLeadIdIsRole = await recordExists(User, { id: teamLeadId, roleId: 2 });
        if (!teamLeadIdIsRole) {
            res.status(400).json({ message: 'Team lead must be a team lead' });
            return; 
        }
        const team = await Team.create({
            teamName,
            teamLeadId
        });
        await User.update(
            { teamId: team.id }, // Set the new team ID
            { where: { id: teamLeadId } } // Find the user by teamLeadId
        );
        res.status(201).json({ massage: 'Team created successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const getTeam = async (req: Request, res: Response) : Promise<void> => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }
        const team = await Team.findAll({
            include: [
                { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });

        const filteredTeam = team.map((team) => {
            const plainTeam = team.get({ plain: true }); 
            const { teamLead, teamMembers } = plainTeam;
            const filteredTeamMembers = teamMembers.filter(
                (member: User) => member.id !== teamLead.id
            );

            return { ...plainTeam, teamMembers: filteredTeamMembers };
        }); 
        res.status(200).json(filteredTeam);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

export const getTeamById = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Token is not found' });
            return;
        }
        const team = await Team.findByPk(id, {
            include: [
                { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });

        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        const plainTeam = team.get({ plain: true });
        const { teamLead, teamMembers } = plainTeam;
        const filteredTeamMembers = teamMembers.filter(
            (member: User) => member.id !== teamLead.id
        );

        res.status(200).json({ ...plainTeam, teamMembers: filteredTeamMembers });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}

export const updateTeam = async (req: Request, res: Response) : Promise<void> => {
    const { teamName, teamLeadId } = req.body;
    const  id  = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Token is not found' });
            return;
        }

        const team = await Team.findByPk(id);
        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        
        const teamLeadIdIsRole = await recordExists(User, { id: teamLeadId, roleId: 2 });
        if (!teamLeadIdIsRole) {
            res.status(400).json({ message: 'Team lead must be a team lead' });
            return; 
        }

        if(teamLeadId){
            const newTeamLead = await User.findByPk(teamLeadId,{
                include: [
                    {
                        model: Roles,
                        as: 'role'
                    }
                ]
            });
            console.log("newTEamLead",newTeamLead);

            if(!newTeamLead || newTeamLead.role?.roleName !== 'teamLead'){
                res.status(400).json({ message: 'Invalid team lead ID' });
                return;
            }
        }

        const currentTeamLeadId = team.teamLeadId;
        console.log("currentTeamLeadId :", currentTeamLeadId);
        await Team.update(
            { teamName, teamLeadId },
            { where: { id } }
        );

        if(currentTeamLeadId){
            await User.update(
                { teamId: null },
                { where: { id: currentTeamLeadId } }
            );
        }

        if(teamLeadId){
            await User.update(
                { teamId: id },
                { where: { id: teamLeadId } }
            );
        }

        res.status(200).json({ message: 'Team updated successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

export const removeTeamMember = async(req: Request, res: Response): Promise<void> =>{
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Token is not found' });
            return;
        }

        const team = await Team.findByPk(id);
        if(!team){
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        const userExists = await recordExists(User, {id: teamMemberId});
        if (!userExists) {
            res.status(404).json({ message: 'user is not exist' });
            return;
        }

        const userIsinTeam = await recordExists(User, {id: teamMemberId, teamId: id});
        if (!userIsinTeam) {
            res.status(404).json({ message: 'user is not in the team' });
            return;
        }

        await User.update(
            { teamId: null },
            { where: { id: teamMemberId } }
        );

        res.status(200).json({ message: 'Team member removed successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};


export const addMeberToTeam = async(req: Request, res: Response) : Promise<void> =>{
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Token is not found' });
            return;
        }

        const team = await Team.findByPk(id);
        if(!team){
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        const userExists = await recordExists(User, {id:teamMemberId});
        if (!userExists) {
            res.status(404).json({ message: 'user is not exist' });
            return;
        }

        await User.update(
            { teamId: id },
            { where: { id: teamMemberId } }
        );

        res.status(200).json({ message: 'Team member added successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

export const deleteTeam = async(req: Request, res: Response) : Promise<void> =>{
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Token is not found' });
            return;
        }

        const team = await Team.findByPk(id);
        if(!team){
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        await User.update(
            { teamId: null },
            { where: { teamId: id } }
        );

        await team.destroy();
        res.status(200).json({ message: 'Team deleted successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};
