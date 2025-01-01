
import Team from "../model/team.model";
import { Request, Response } from 'express';
import User from "../model/user.model";
import Roles from "../model/rols.model";
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";

export const createTeam = async (req: Request, res: Response) => {
    
    const { teamName, teamLeadId } = req.body;
    console.log("teamName :", teamName);
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const teamLeadExists = await recordExists(User, teamLeadId);
        if (!teamLeadExists) {
            return res.status(404).json({ message: 'Team lead not found' });
        }
        const teamExists = await recordExists(Team, { teamName : teamName, teamLeadId: teamLeadId });
        if (teamExists) {
            return res.status(409).json({ message: 'Team is alrady exist' });
        }

        const team = await Team.create({
            teamName,
            teamLeadId
        });
        await User.update(
            { teamId: team.id }, // Set the new team ID
            { where: { id: teamLeadId } } // Find the user by teamLeadId
        );
        return res.status(201).json({ massage: 'Team created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getTeam = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
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
                (member: any) => member.id !== teamLead.id
            );

            return { ...plainTeam, teamMembers: filteredTeamMembers };
        }); 
        return res.status(200).json(filteredTeam);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTeamById = async (req: Request, res: Response) => {
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = await Team.findByPk(id, {
            include: [
                { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const plainTeam = team.get({ plain: true });
        const { teamLead, teamMembers } = plainTeam;
        const filteredTeamMembers = teamMembers.filter(
            (member: any) => member.id !== teamLead.id
        );

        return res.status(200).json({ ...plainTeam, teamMembers: filteredTeamMembers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateTeam = async (req: Request, res: Response) => {
    const { teamName, teamLeadId } = req.body;
    const  id  = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const team = await Team.findByPk(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
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
                return res.status(400).json({ message: 'Invalid team lead ID' });
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

        return res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeTeamMember = async(req: Request, res: Response)=>{
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const team = await Team.findByPk(id);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }
        const userExists = await recordExists(User, {id});
        if (!userExists) {
            return res.status(404).json({ message: 'user is not exist' });
        }

        await User.update(
            { teamId: null },
            { where: { id: teamMemberId } }
        );

        return res.status(200).json({ message: 'Team member removed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export const addMeberToTeam = async(req: Request, res: Response)=>{
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const team = await Team.findByPk(id);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }
        const userExists = await recordExists(User, {id:teamMemberId});
        if (!userExists) {
            return res.status(404).json({ message: 'user is not exist' });
        }

        await User.update(
            { teamId: id },
            { where: { id: teamMemberId } }
        );

        return res.status(200).json({ message: 'Team member added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteTeam = async(req: Request, res: Response)=>{
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const team = await Team.findByPk(id);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }

        await User.update(
            { teamId: null },
            { where: { teamId: id } }
        );

        await team.destroy();
        return res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
