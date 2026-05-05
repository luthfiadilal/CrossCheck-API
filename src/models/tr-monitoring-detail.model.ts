import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TrMonitoringDetailAttributes {
  detail_id: string;
  log_id: string;
  task_type_id: string;
  nama_anggota: string | null;
  quantity?: string | null;
  conditions?: string | null;
  photo_path?: string | null;
  descriptions?: string | null;
  nomor_baris?:string | null;
  locations?: string | null;
  status_task?: string | null;
  created_at?: string | null;
}

interface TrMonitoringDetailCreationAttributes
  extends Optional<
    TrMonitoringDetailAttributes,
     "nama_anggota"| "quantity" | "conditions" | "photo_path" | "descriptions" | "locations" | "nomor_baris" | "status_task" | "created_at"
  > { }

class TrMonitoringDetail
  extends Model<TrMonitoringDetailAttributes, TrMonitoringDetailCreationAttributes>
  implements TrMonitoringDetailAttributes {
  public detail_id!: string;
  public log_id!: string;
  public task_type_id!: string;
  public nama_anggota!: string | null;
  public quantity!: string | null;
  public conditions!: string | null;
  public photo_path!: string | null;
  public descriptions!: string | null;
  public nomor_baris!: string | null;
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
    nama_anggota: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Nama anggota",
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
    nomor_baris: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Nomor baris pekerjaan yang sedang di monitor",
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
