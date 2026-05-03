import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface MsTaskTypeAttributes {
  task_type_id: string;
  task_name: string;
  unit_measure: string;
  created_at?: string | null;
}

interface MsTaskTypeCreationAttributes extends Optional<MsTaskTypeAttributes, "created_at"> {}

class MsTaskType
  extends Model<MsTaskTypeAttributes, MsTaskTypeCreationAttributes>
  implements MsTaskTypeAttributes
{
  public task_type_id!: string;
  public task_name!: string;
  public unit_measure!: string;
  public created_at!: string | null;
}

MsTaskType.init(
  {
    task_type_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik tipe tugas",
    },
    task_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama pekerjaan (Contoh: Beneficial plant, Pruning, dll)",
    },
    unit_measure: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Satuan ukur (hektar, tph, pokok, dll)",
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu data master dibuat",
    },
  },
  {
    sequelize,
    tableName: "ms_task_type",
    timestamps: false,
  }
);

export default MsTaskType;
