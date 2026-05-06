import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TrMonitoringPhotoAttributes {
  photo_id: string;
  detail_id: string;
  photo_path: string;
  caption: string | null;
  created_at: string | null;
}

interface TrMonitoringPhotoCreationAttributes
  extends Optional<TrMonitoringPhotoAttributes, "caption" | "created_at"> {}

class TrMonitoringPhoto
  extends Model<TrMonitoringPhotoAttributes, TrMonitoringPhotoCreationAttributes>
  implements TrMonitoringPhotoAttributes {
  public photo_id!: string;
  public detail_id!: string;
  public photo_path!: string;
  public caption!: string | null;
  public created_at!: string | null;
}

TrMonitoringPhoto.init(
  {
    photo_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    detail_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    photo_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tr_monitoring_photos",
    timestamps: false,
  }
);

export default TrMonitoringPhoto;
