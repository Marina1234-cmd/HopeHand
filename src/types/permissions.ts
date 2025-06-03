export type ResourceType = 
  | 'campaign'
  | 'donation'
  | 'user'
  | 'volunteer'
  | 'notification'
  | 'report'
  | 'payment'
  | 'settings'
  | 'audit_log'

export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'verify'
  | 'manage'
  | 'export'
  | 'import'

export type ComponentType =
  | 'AdminDashboard'
  | 'UserManagement'
  | 'CampaignManagement'
  | 'DonationHistory'
  | 'PaymentSettings'
  | 'SecuritySettings'
  | 'AuditLogs'
  | 'Reports'
  | 'Analytics'
  | 'NotificationCenter'

// Specific permissions for each resource type
export interface ResourcePermissions {
  campaign: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    approve: boolean
    reject: boolean
    manageDonations: boolean
    manageVolunteers: boolean
    exportData: boolean
  }
  donation: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    refund: boolean
    export: boolean
  }
  user: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    manageRoles: boolean
    resetPassword: boolean
    verifyEmail: boolean
    exportData: boolean
  }
  volunteer: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    verify: boolean
    assign: boolean
    track: boolean
  }
  notification: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    sendBulk: boolean
    manageTemplates: boolean
  }
  report: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    export: boolean
    schedule: boolean
  }
  payment: {
    process: boolean
    refund: boolean
    viewTransactions: boolean
    manageGateways: boolean
    viewAnalytics: boolean
  }
  settings: {
    read: boolean
    update: boolean
    manageIntegrations: boolean
    manageApiKeys: boolean
    manageSecuritySettings: boolean
  }
  audit_log: {
    read: boolean
    export: boolean
    delete: boolean
    configure: boolean
  }
}

// Component-level permissions
export interface ComponentPermissions {
  AdminDashboard: {
    view: boolean
    manageWidgets: boolean
    exportData: boolean
  }
  UserManagement: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    assignRoles: boolean
  }
  CampaignManagement: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    approve: boolean
  }
  DonationHistory: {
    view: boolean
    export: boolean
    process: boolean
    refund: boolean
  }
  PaymentSettings: {
    view: boolean
    update: boolean
    manageGateways: boolean
    viewAnalytics: boolean
  }
  SecuritySettings: {
    view: boolean
    update: boolean
    manageApiKeys: boolean
    viewAuditLogs: boolean
  }
  AuditLogs: {
    view: boolean
    export: boolean
    filter: boolean
    configure: boolean
  }
  Reports: {
    view: boolean
    create: boolean
    schedule: boolean
    export: boolean
  }
  Analytics: {
    view: boolean
    export: boolean
    configure: boolean
  }
  NotificationCenter: {
    view: boolean
    send: boolean
    manageTemplates: boolean
    configure: boolean
  }
}

// Combined permissions interface
export interface Permissions {
  resources: ResourcePermissions
  components: ComponentPermissions
}

// Default permission sets for different user roles
export const DEFAULT_PERMISSIONS: Record<string, Permissions> = {
  admin: {
    resources: {
      campaign: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: true,
        reject: true,
        manageDonations: true,
        manageVolunteers: true,
        exportData: true
      },
      donation: {
        create: true,
        read: true,
        update: true,
        delete: true,
        refund: true,
        export: true
      },
      user: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manageRoles: true,
        resetPassword: true,
        verifyEmail: true,
        exportData: true
      },
      volunteer: {
        create: true,
        read: true,
        update: true,
        delete: true,
        verify: true,
        assign: true,
        track: true
      },
      notification: {
        create: true,
        read: true,
        update: true,
        delete: true,
        sendBulk: true,
        manageTemplates: true
      },
      report: {
        create: true,
        read: true,
        update: true,
        delete: true,
        export: true,
        schedule: true
      },
      payment: {
        process: true,
        refund: true,
        viewTransactions: true,
        manageGateways: true,
        viewAnalytics: true
      },
      settings: {
        read: true,
        update: true,
        manageIntegrations: true,
        manageApiKeys: true,
        manageSecuritySettings: true
      },
      audit_log: {
        read: true,
        export: true,
        delete: true,
        configure: true
      }
    },
    components: {
      AdminDashboard: {
        view: true,
        manageWidgets: true,
        exportData: true
      },
      UserManagement: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        assignRoles: true
      },
      CampaignManagement: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true
      },
      DonationHistory: {
        view: true,
        export: true,
        process: true,
        refund: true
      },
      PaymentSettings: {
        view: true,
        update: true,
        manageGateways: true,
        viewAnalytics: true
      },
      SecuritySettings: {
        view: true,
        update: true,
        manageApiKeys: true,
        viewAuditLogs: true
      },
      AuditLogs: {
        view: true,
        export: true,
        filter: true,
        configure: true
      },
      Reports: {
        view: true,
        create: true,
        schedule: true,
        export: true
      },
      Analytics: {
        view: true,
        export: true,
        configure: true
      },
      NotificationCenter: {
        view: true,
        send: true,
        manageTemplates: true,
        configure: true
      }
    }
  },
  moderator: {
    resources: {
      campaign: {
        create: false,
        read: true,
        update: true,
        delete: false,
        approve: true,
        reject: true,
        manageDonations: true,
        manageVolunteers: true,
        exportData: true
      },
      donation: {
        create: true,
        read: true,
        update: true,
        delete: false,
        refund: false,
        export: true
      },
      user: {
        create: false,
        read: true,
        update: false,
        delete: false,
        manageRoles: false,
        resetPassword: false,
        verifyEmail: true,
        exportData: false
      },
      volunteer: {
        create: true,
        read: true,
        update: true,
        delete: false,
        verify: true,
        assign: true,
        track: true
      },
      notification: {
        create: true,
        read: true,
        update: true,
        delete: false,
        sendBulk: false,
        manageTemplates: false
      },
      report: {
        create: true,
        read: true,
        update: true,
        delete: false,
        export: true,
        schedule: false
      },
      payment: {
        process: false,
        refund: false,
        viewTransactions: true,
        manageGateways: false,
        viewAnalytics: true
      },
      settings: {
        read: true,
        update: false,
        manageIntegrations: false,
        manageApiKeys: false,
        manageSecuritySettings: false
      },
      audit_log: {
        read: true,
        export: false,
        delete: false,
        configure: false
      }
    },
    components: {
      AdminDashboard: {
        view: true,
        manageWidgets: false,
        exportData: true
      },
      UserManagement: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        assignRoles: false
      },
      CampaignManagement: {
        view: true,
        create: false,
        edit: true,
        delete: false,
        approve: true
      },
      DonationHistory: {
        view: true,
        export: true,
        process: false,
        refund: false
      },
      PaymentSettings: {
        view: true,
        update: false,
        manageGateways: false,
        viewAnalytics: true
      },
      SecuritySettings: {
        view: false,
        update: false,
        manageApiKeys: false,
        viewAuditLogs: true
      },
      AuditLogs: {
        view: true,
        export: false,
        filter: true,
        configure: false
      },
      Reports: {
        view: true,
        create: true,
        schedule: false,
        export: true
      },
      Analytics: {
        view: true,
        export: true,
        configure: false
      },
      NotificationCenter: {
        view: true,
        send: true,
        manageTemplates: false,
        configure: false
      }
    }
  },
  campaignManager: {
    resources: {
      campaign: {
        create: true,
        read: true,
        update: true,
        delete: false,
        approve: false,
        reject: false,
        manageDonations: true,
        manageVolunteers: true,
        exportData: true
      },
      donation: {
        create: true,
        read: true,
        update: false,
        delete: false,
        refund: false,
        export: true
      },
      user: {
        create: false,
        read: true,
        update: false,
        delete: false,
        manageRoles: false,
        resetPassword: false,
        verifyEmail: false,
        exportData: false
      },
      volunteer: {
        create: true,
        read: true,
        update: true,
        delete: false,
        verify: false,
        assign: true,
        track: true
      },
      notification: {
        create: true,
        read: true,
        update: true,
        delete: false,
        sendBulk: false,
        manageTemplates: false
      },
      report: {
        create: true,
        read: true,
        update: true,
        delete: false,
        export: true,
        schedule: true
      },
      payment: {
        process: false,
        refund: false,
        viewTransactions: true,
        manageGateways: false,
        viewAnalytics: true
      },
      settings: {
        read: true,
        update: false,
        manageIntegrations: false,
        manageApiKeys: false,
        manageSecuritySettings: false
      },
      audit_log: {
        read: false,
        export: false,
        delete: false,
        configure: false
      }
    },
    components: {
      AdminDashboard: {
        view: false,
        manageWidgets: false,
        exportData: false
      },
      UserManagement: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        assignRoles: false
      },
      CampaignManagement: {
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: false
      },
      DonationHistory: {
        view: true,
        export: true,
        process: false,
        refund: false
      },
      PaymentSettings: {
        view: false,
        update: false,
        manageGateways: false,
        viewAnalytics: false
      },
      SecuritySettings: {
        view: false,
        update: false,
        manageApiKeys: false,
        viewAuditLogs: false
      },
      AuditLogs: {
        view: false,
        export: false,
        filter: false,
        configure: false
      },
      Reports: {
        view: true,
        create: true,
        schedule: true,
        export: true
      },
      Analytics: {
        view: true,
        export: true,
        configure: false
      },
      NotificationCenter: {
        view: true,
        send: true,
        manageTemplates: false,
        configure: false
      }
    }
  }
} 