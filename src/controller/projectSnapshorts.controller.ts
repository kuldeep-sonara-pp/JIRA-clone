export const createProjectSnapshot = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        const project = await recordExists(Projects, { id: projectId });
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return; 
        }
        const snapshot = await ProjectSnapshots.create({ projectId });
        res.status(201).json({ snapshot });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}