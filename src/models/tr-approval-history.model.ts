import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface TrApprovalHistoryAttributes {
  approval_id: string;
  log_id: string;
  approver_id: string;
  status_approval: string;
  notes?: string | null;
  action_date: string;
}

interface TrApprovalHistoryCreationAttributes extends TrApprovalHistoryAttributes {}

class TrApprovalHistory
  extends Model<TrApprovalHistoryAttributes, TrApprovalHistoryCreationAttributes>
  implements TrApprovalHistoryAttributes
{
  public approval_id!: string;
  public log_id!: string;
  public approver_id!: string;
  public status_approval!: string;
  public notes!: string | null;
  public action_date!: string;
}

TrApprovalHistory.init(
  {
    approval_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: "ID unik riwayat verifikasi",
    },
    log_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ID laporan yang diverifikasi",
    },
    approver_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ID User yang melakukan verifikasi (ms_user)",
    },
    status_approval: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Keputusan: APPROVE atau RE-CHECK",
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Alasan penolakan atau catatan tambahan dari atasan",
    },
    action_date: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Waktu tindakan verifikasi dilakukan",
    },
  },
  {
    sequelize,
    tableName: "tr_approval_history",
    timestamps: false,
  }
);

export default TrApprovalHistory;
