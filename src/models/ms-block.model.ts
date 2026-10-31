import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface MsBlockAttributes {
  block_id: string;
  block_code: string;
  block_name: string;
  afdeling?: string | null;
  area_ha?: number | null;
  created_at?: string | null;
}

interface MsBlockCreationAttributes
  extends Optional<MsBlockAttributes, "afdeling" | "area_ha" | "created_at"> {}

class MsBlock
  extends Model<MsBlockAttributes, MsBlockCreationAttributes>
  implements MsBlockAttributes
{
  public block_id!: string;
  public block_code!: string;
  public block_name!: string;
  public afdeling!: string | null;
  public area_ha!: number | null;
  public created_at!: string | null;
}

MsBlock.init(
  {
    block_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik blok",
    },
    block_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Kode blok untuk QR Code (Contoh: PL01, PL02)",
    },
    block_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama blok (Contoh: Blok PL01)",
    },
    afdeling: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Nama Afdeling / Divisi",
    },
    area_ha: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Luas blok dalam Hektar",
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu data master dibuat",
    },
  },
  {
    sequelize,
    tableName: "ms_block",
    timestamps: false,
  }
);

export default MsBlock;
