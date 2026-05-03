import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TrMonitoringDetailAttributes {
  detail_id: string;
  log_id: string;
  task_type_id: string;
  quantity?: string | null;
  conditions?: string | null;
  photo_path?: string | null;
  descriptions?: string | null;
  locations?: string | null;
  status_task?: string | null;
  created_at?: string | null;
}

interface TrMonitoringDetailCreationAttributes
  extends Optional<
    TrMonitoringDetailAttributes,
    "quantity" | "conditions" | "photo_path" | "descriptions" | "locations" | "status_task" | "created_at"
  > { }

class TrMonitoringDetail
  extends Model<TrMonitoringDetailAttributes, TrMonitoringDetailCreationAttributes>
  implements TrMonitoringDetailAttributes {
  public detail_id!: string;
  public log_id!: string;
  public task_type_id!: string;
  public quantity!: string | null;
  public conditions!: string | null;
  public photo_path!: string | null;
  public descriptions!: string | null;
  public locations!: string | null;
  public status_task!: string | null;
  public created_at!: string | null;
}

TrMonitoringDetail.init(
  {
    detail_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik baris detail",
    },
    log_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ID Header Relasi ke tr_monitoring_log",
    },
    task_type_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ID Jenis pekerjaan Relasi ke ms_task_type",
    },
    quantity: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Jumlah hasil kerja yang dicapai",
    },
    conditions: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Kualitas hasil kerja BAIK SEDANG atau BURUK",
    },
    photo_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Alamat simpan file foto bukti lapangan",
    },
    descriptions: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Catatan tambahan terkait kondisi di lapangan",
    },
    locations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Lokasi",
    },
    status_task: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "PENDING, RECHECK, APPROVED",
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu detail item ini dicatat",
    },
  },
  {
    sequelize,
    tableName: "tr_monitoring_detail",
    timestamps: false,
  }
);

export default TrMonitoringDetail;
