import { FindOptions, Model, ModelStatic } from "sequelize";

export const paginate = async <T extends Model>(
  model: ModelStatic<T>, 
  options: FindOptions<T>
) => {
  const page = parseInt((options.offset as unknown as string) || "1");
  const limit = parseInt((options.limit as unknown as string) || "10");
  const offset = (page - 1) * limit;

  const { count: totalCount, rows: data } = await model.findAndCountAll({
    ...options,
    offset,
    limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    totalCount,
    data,
  };
};
