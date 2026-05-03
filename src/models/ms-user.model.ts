import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface MsUserAttributes {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  parent_user_id?: string | null;
  is_active?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface MsUserCreationAttributes
  extends Optional<MsUserAttributes, "parent_user_id" | "is_active" | "created_at" | "updated_at"> {}

class MsUser
  extends Model<MsUserAttributes, MsUserCreationAttributes>
  implements MsUserAttributes
{
  public user_id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public parent_user_id!: string | null;
  public is_active!: number | null;
  public created_at!: string | null;
  public updated_at!: string | null;
}

MsUser.init(
  {
    user_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik pengguna, dibuat melalui helper backend",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama lengkap karyawan",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Jabatan: MANDOR, ASISTEN_LAPANGAN, atau KEPALA_KEBUN",
    },
    parent_user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID Atasan langsung untuk hirarki approval",
    },
    is_active: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu data dibuat (format ISO 8601)",
    },
    updated_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu data terakhir diubah",
    },
  },
  {
    sequelize,
    tableName: "ms_user",
    timestamps: false,
  }
);

export default MsUser;
