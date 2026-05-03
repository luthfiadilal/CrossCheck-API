import { Request, Response } from "express";

export const getExample = (_req: Request, res: Response): void => {
  res.json({
    status: "success",
    message: "GET /api/example",
    data: [],
  });
};

export const createExample = (req: Request, res: Response): void => {
  const { body } = req;

  res.status(201).json({
    status: "success",
    message: "POST /api/example",
    data: body,
  });
};
