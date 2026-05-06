import sequelize from "../config/database";
import MsTaskType from "./ms-task-type.model";
import MsUser from "./ms-user.model";
import TrMonitoringLog from "./tr-monitoring-log.model";
import TrMonitoringDetail from "./tr-monitoring-detail.model";
import TrApprovalHistory from "./tr-approval-history.model";
import TrMonitoringPhoto from "./tr-monitoring-photo.model";

// ===================== Associations =====================

// MsUser self-referencing: atasan -> bawahan
MsUser.hasMany(MsUser, { foreignKey: "parent_user_id", as: "subordinates", constraints: false });
MsUser.belongsTo(MsUser, { foreignKey: "parent_user_id", as: "superior", constraints: false });

// MsUser (mandor) -> TrMonitoringLog
MsUser.hasMany(TrMonitoringLog, { foreignKey: "mandor_id", as: "monitoringLogs", constraints: false });
TrMonitoringLog.belongsTo(MsUser, { foreignKey: "mandor_id", as: "mandor", constraints: false });

// TrMonitoringLog -> TrMonitoringDetail (one-to-many)
TrMonitoringLog.hasMany(TrMonitoringDetail, { foreignKey: "log_id", as: "details", constraints: false });
TrMonitoringDetail.belongsTo(TrMonitoringLog, { foreignKey: "log_id", as: "monitoringLog", constraints: false });

// MsTaskType -> TrMonitoringDetail
MsTaskType.hasMany(TrMonitoringDetail, { foreignKey: "task_type_id", as: "monitoringDetails", constraints: false });
TrMonitoringDetail.belongsTo(MsTaskType, { foreignKey: "task_type_id", as: "taskType", constraints: false });

// TrMonitoringLog -> TrApprovalHistory (one-to-many)
TrMonitoringLog.hasMany(TrApprovalHistory, { foreignKey: "log_id", as: "approvalHistories", constraints: false });
TrApprovalHistory.belongsTo(TrMonitoringLog, { foreignKey: "log_id", as: "monitoringLog", constraints: false });

// MsUser (approver) -> TrApprovalHistory
MsUser.hasMany(TrApprovalHistory, { foreignKey: "approver_id", as: "approvals", constraints: false });
TrApprovalHistory.belongsTo(MsUser, { foreignKey: "approver_id", as: "approver", constraints: false });

// TrMonitoringDetail -> TrMonitoringPhoto (one-to-many)
TrMonitoringDetail.hasMany(TrMonitoringPhoto, { foreignKey: "detail_id", as: "photos", constraints: false });
TrMonitoringPhoto.belongsTo(TrMonitoringDetail, { foreignKey: "detail_id", as: "detail", constraints: false });

// ========================================================

const db = {
  sequelize,
  MsTaskType,
  MsUser,
  TrMonitoringLog,
  TrMonitoringDetail,
  TrApprovalHistory,
  TrMonitoringPhoto,
};

export default db;
