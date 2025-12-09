"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranscationId = void 0;
const getTranscationId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}}`;
};
exports.getTranscationId = getTranscationId;
