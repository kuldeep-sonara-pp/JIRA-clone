"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = (model, options) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(options.offset) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;
    const { count: totalCount, rows: data } = yield model.findAndCountAll(Object.assign(Object.assign({}, options), { offset, limit }));
    const totalPages = Math.ceil(totalCount / limit);
    return {
        currentPage: page,
        totalPages,
        hasPrevious: page > 1,
        hasNext: page < totalPages,
        totalCount,
        data,
    };
});
exports.paginate = paginate;
