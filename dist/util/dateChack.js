"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateCheck = void 0;
const dateCheck = (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return 'Start date cannot be later than end date.';
    }
    return null;
};
exports.dateCheck = dateCheck;
