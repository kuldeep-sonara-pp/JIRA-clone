import { Request } from "express";
import { FindOptions, Model, ModelStatic } from "sequelize";

export const paginate = async <T extends Model>(
  model: ModelStatic<T>, 
  options: FindOptions,
  req: Request
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const offset = (page - 1) * limit;

  const { count: totalCount, rows: data } = await model.findAndCountAll({
    ...options,
    offset,
    limit,
    order: [['id', 'Asc']]
  });

  const totalPages = Math.ceil(totalCount / limit);

  // Check for invalid page numbers
  if (page < 1) {
    throw new Error(`Page ${page} is invalid. Page numbers must be greater than 0.`);
  }
  
  if (totalPages === 0) {
    throw new Error(`No data available. Total pages: ${totalPages}`);
  }

  if (page > totalPages) {
    throw new Error(`Page ${page} does not exist. Total pages: ${totalPages}`);
  }

  return {
    currentPage: page,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    totalCount,
    data,
  };
};
