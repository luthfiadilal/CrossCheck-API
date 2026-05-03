import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TrMonitoringLogAttributes {
  log_id: string;
  worker_name: string;
  mandor_id: string;
  status_approval?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface TrMonitoringLogCreationAttributes
  extends Optional<
    TrMonitoringLogAttributes,
    "status_approval" | "created_at" | "updated_at"
  > { }

class TrMonitoringLog
  extends Model<TrMonitoringLogAttributes, TrMonitoringLogCreationAttributes>
  implements TrMonitoringLogAttributes {
  public log_id!: string;
  public worker_name!: string;
  public mandor_id!: string;
  public location_lat!: string | null;
  public location_long!: string | null;
  public status_approval!: string | null;
  public created_at!: string | null;
  public updated_at!: string | null;
}

TrMonitoringLog.init(
  {
    log_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik transaksi laporan",
    },
    worker_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama pekerja lapangan yang melakukan tugas",
    },
    mandor_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ID Mandor yang bertanggung jawab (Relasi ke ms_user)",
    },

    status_approval: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "PENDING",
      comment: "Status akhir laporan: PENDING, APPROVED, atau RE-CHECK",
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu laporan pertama kali dikirim",
    },
    updated_at: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Waktu update status terakhir",
    },
  },
  {
    sequelize,
    tableName: "tr_monitoring_log",
    timestamps: false,
  }
);

export default TrMonitoringLog;
