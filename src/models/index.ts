import sequelize from "../config/database";
import MsTaskType from "./ms-task-type.model";
import MsUser from "./ms-user.model";
import TrMonitoringLog from "./tr-monitoring-log.model";
import TrMonitoringDetail from "./tr-monitoring-detail.model";
import TrApprovalHistory from "./tr-approval-history.model";
import TrMonitoringPhoto from "./tr-monitoring-photo.model";

// ===================== Associations =====================

// MsUser self-referencing: atasan -> bawahan
MsUser.hasMany(MsUser, { foreignKey: "parent_user_id", as: "subordinates" });
MsUser.belongsTo(MsUser, { foreignKey: "parent_user_id", as: "superior" });

// MsUser (mandor) -> TrMonitoringLog
MsUser.hasMany(TrMonitoringLog, { foreignKey: "mandor_id", as: "monitoringLogs" });
TrMonitoringLog.belongsTo(MsUser, { foreignKey: "mandor_id", as: "mandor" });

// TrMonitoringLog -> TrMonitoringDetail (one-to-many)
TrMonitoringLog.hasMany(TrMonitoringDetail, { foreignKey: "log_id", as: "details" });
TrMonitoringDetail.belongsTo(TrMonitoringLog, { foreignKey: "log_id", as: "monitoringLog" });

// MsTaskType -> TrMonitoringDetail
MsTaskType.hasMany(TrMonitoringDetail, { foreignKey: "task_type_id", as: "monitoringDetails" });
TrMonitoringDetail.belongsTo(MsTaskType, { foreignKey: "task_type_id", as: "taskType" });

// TrMonitoringLog -> TrApprovalHistory (one-to-many)
TrMonitoringLog.hasMany(TrApprovalHistory, { foreignKey: "log_id", as: "approvalHistories" });
TrApprovalHistory.belongsTo(TrMonitoringLog, { foreignKey: "log_id", as: "monitoringLog" });

// MsUser (approver) -> TrApprovalHistory
MsUser.hasMany(TrApprovalHistory, { foreignKey: "approver_id", as: "approvals" });
TrApprovalHistory.belongsTo(MsUser, { foreignKey: "approver_id", as: "approver" });

// TrMonitoringDetail -> TrMonitoringPhoto (one-to-many)
TrMonitoringDetail.hasMany(TrMonitoringPhoto, { foreignKey: "detail_id", as: "photos" });
TrMonitoringPhoto.belongsTo(TrMonitoringDetail, { foreignKey: "detail_id", as: "detail" });

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
