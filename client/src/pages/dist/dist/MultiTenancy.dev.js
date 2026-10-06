"use strict";
/**
 * Multi-Tenancy Management Page
 * Kiini super-admins can create/edit/delete organizations (tenants),
 * toggle per-org module availability, assign users to organizations,
 * manage pricing tiers, view tenant admins list, and send tenant communications.
 */

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

exports.__esModule = true;

var react_1 = require("react");

var wouter_1 = require("wouter");

var ModuleLayout_1 = require("@/components/ModuleLayout");

var trpc_1 = require("@/lib/trpc");

var sonner_1 = require("sonner");

var card_1 = require("@/components/ui/card");

var button_1 = require("@/components/ui/button");

var badge_1 = require("@/components/ui/badge");

var input_1 = require("@/components/ui/input");

var label_1 = require("@/components/ui/label");

var textarea_1 = require("@/components/ui/textarea");

var select_1 = require("@/components/ui/select");

var dialog_1 = require("@/components/ui/dialog");

var tabs_1 = require("@/components/ui/tabs");

var alert_dialog_1 = require("@/components/ui/alert-dialog");

var lucide_react_1 = require("lucide-react");

var date_fns_1 = require("date-fns"); // ─── helpers ────────────────────────────────────────────────────────────────


var PLAN_OPTIONS = ["trial", "starter", "professional", "enterprise", "custom"];
var PLAN_COLORS = {
  trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  professional: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  enterprise: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  custom: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
};
var PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

function planBadge(plan) {
  var _a;

  var cls = (_a = PLAN_COLORS[plan]) !== null && _a !== void 0 ? _a : "bg-gray-100 text-gray-700";
  return React.createElement("span", {
    className: "inline-block rounded px-2 py-0.5 text-xs font-medium capitalize " + cls
  }, plan);
}

function slugify(v) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fmt(dt) {
  if (!dt) return "\u2014";

  try {
    return date_fns_1.format(date_fns_1.parseISO(dt), "d MMM yyyy");
  } catch (_a) {
    return dt.slice(0, 10);
  }
}

function fmtFull(dt) {
  if (!dt) return "\u2014";

  try {
    return date_fns_1.format(date_fns_1.parseISO(dt), "d MMM yyyy, h:mm a");
  } catch (_a) {
    return dt;
  }
} // ─── Form defaults ───────────────────────────────────────────────────────────


var BLANK_FORM = {
  name: "",
  slug: "",
  plan: "trial",
  maxUsers: 10,
  contactEmail: "",
  contactPhone: "",
  domain: "",
  country: "",
  address: "",
  adminMode: "create",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  existingUserId: ""
};
var BLANK_MESSAGE = {
  subject: "",
  content: "",
  priority: "normal",
  targetType: "all_admins",
  targetOrgId: "",
  targetUserId: ""
}; // ─────────────────────────────────────────────────────────────────────────────

function MultiTenancy() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;

  var utils = trpc_1.trpc.useUtils(); // Sync active tab with URL (wouter location)

  var location = wouter_1.useLocation()[0];

  var tabFromPath = function tabFromPath(p) {
    return p.includes("tenant-admins") ? "admins" : p.includes("pricing") ? "pricing" : p.includes("tenant-comms") ? "comms" : "organizations";
  };

  var _l = react_1.useState(function () {
    return tabFromPath(location);
  }),
      mainTab = _l[0],
      setMainTab = _l[1];

  react_1.useEffect(function () {
    setMainTab(tabFromPath(location));
  }, [location]); // ── List ─────────────────────────────────────────────────────────────────

  var _m = trpc_1.trpc.multiTenancy.listOrganizations.useQuery(),
      listData = _m.data,
      listLoading = _m.isLoading,
      refetchList = _m.refetch;

  var orgs = (_a = listData === null || listData === void 0 ? void 0 : listData.organizations) !== null && _a !== void 0 ? _a : []; // ── Selected org detail ───────────────────────────────────────────────────

  var _o = react_1.useState(null),
      selectedOrgId = _o[0],
      setSelectedOrgId = _o[1];

  var _p = trpc_1.trpc.multiTenancy.getOrganization.useQuery({
    id: selectedOrgId
  }, {
    enabled: !!selectedOrgId
  }),
      orgDetail = _p.data,
      detailLoading = _p.isLoading;

  var _q = trpc_1.trpc.multiTenancy.getOrgFeatures.useQuery({
    organizationId: selectedOrgId
  }, {
    enabled: !!selectedOrgId
  }),
      featuresData = _q.data,
      featuresLoading = _q.isLoading;

  var featureMap = (_b = featuresData === null || featuresData === void 0 ? void 0 : featuresData.features) !== null && _b !== void 0 ? _b : {};
  var orgUsersData = trpc_1.trpc.multiTenancy.getOrgUsers.useQuery({
    organizationId: selectedOrgId
  }, {
    enabled: !!selectedOrgId
  }).data;
  var orgUsers = (_c = orgUsersData === null || orgUsersData === void 0 ? void 0 : orgUsersData.users) !== null && _c !== void 0 ? _c : [];
  var allUsersData = trpc_1.trpc.users.list.useQuery().data;
  var allUsers = (_d = allUsersData) !== null && _d !== void 0 ? _d : []; // ── Pricing tier data ─────────────────────────────────────────────────────

  var _r = trpc_1.trpc.multiTenancy.getAllPricingTierFeatures.useQuery(),
      allTierData = _r.data,
      tiersLoading = _r.isLoading;

  var tierMap = (_e = allTierData === null || allTierData === void 0 ? void 0 : allTierData.tiers) !== null && _e !== void 0 ? _e : {}; // ── Tenant admins ─────────────────────────────────────────────────────────

  var _s = trpc_1.trpc.multiTenancy.listTenantAdmins.useQuery(),
      tenantAdminsData = _s.data,
      adminsLoading = _s.isLoading;

  var tenantAdmins = (_f = tenantAdminsData === null || tenantAdminsData === void 0 ? void 0 : tenantAdminsData.admins) !== null && _f !== void 0 ? _f : []; // ── Tenant messages ───────────────────────────────────────────────────────

  var _t = trpc_1.trpc.multiTenancy.getTenantMessages.useQuery({
    limit: 100,
    offset: 0
  }),
      messagesData = _t.data,
      messagesLoading = _t.isLoading,
      refetchMessages = _t.refetch;

  var messages = (_g = messagesData === null || messagesData === void 0 ? void 0 : messagesData.messages) !== null && _g !== void 0 ? _g : []; // ── Mutations ─────────────────────────────────────────────────────────────

  var createOrgWithAdmin = trpc_1.trpc.multiTenancy.createOrganizationWithAdmin.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Organization created with super admin");
      refetchList();
      utils.multiTenancy.listTenantAdmins.invalidate();
      setShowCreate(false);
      setForm(__assign({}, BLANK_FORM));
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var updateOrg = trpc_1.trpc.multiTenancy.updateOrganization.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Organization updated");
      refetchList();
      utils.multiTenancy.getOrganization.invalidate();
      setShowEdit(false);
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var deleteOrg = trpc_1.trpc.multiTenancy.deleteOrganization.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Organization deleted");
      refetchList();
      setToDelete(null);
      setSelectedOrgId(null);
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var setFeature = trpc_1.trpc.multiTenancy.setOrgFeature.useMutation({
    onSuccess: function onSuccess() {
      utils.multiTenancy.getOrgFeatures.invalidate();
      utils.multiTenancy.listOrganizations.invalidate();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var bulkSetFeatures = trpc_1.trpc.multiTenancy.bulkSetOrgFeatures.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Features saved");
      utils.multiTenancy.getOrgFeatures.invalidate();
      utils.multiTenancy.listOrganizations.invalidate();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var assignUser = trpc_1.trpc.multiTenancy.assignUserToOrg.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("User assigned");
      utils.multiTenancy.getOrgUsers.invalidate();
      utils.multiTenancy.listOrganizations.invalidate();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var bulkSetTierFeatures = trpc_1.trpc.multiTenancy.bulkSetPricingTierFeatures.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Pricing tier features saved");
      utils.multiTenancy.getAllPricingTierFeatures.invalidate();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var applyTierToOrg = trpc_1.trpc.multiTenancy.applyTierToOrganization.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Tier features applied to organization");
      utils.multiTenancy.getOrgFeatures.invalidate();
      utils.multiTenancy.listOrganizations.invalidate();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var sendMessage = trpc_1.trpc.multiTenancy.sendTenantMessage.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Message sent to tenant admins");
      refetchMessages();
      setMsgForm(__assign({}, BLANK_MESSAGE));
      setShowCompose(false);
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  });
  var updateOrgAdmin = trpc_1.trpc.multiTenancy.updateOrganizationAdmin.useMutation({
    onSuccess: function onSuccess() {
      sonner_1.toast.success("Organization admin updated");
      utils.multiTenancy.getOrganization.invalidate();
      utils.multiTenancy.listTenantAdmins.invalidate();
      refetchList();
    },
    onError: function onError(e) {
      return sonner_1.toast.error(e.message);
    }
  }); // ── UI state ──────────────────────────────────────────────────────────────

  var _u = react_1.useState(""),
      search = _u[0],
      setSearch = _u[1];

  var _v = react_1.useState(false),
      showCreate = _v[0],
      setShowCreate = _v[1];

  var _w = react_1.useState(false),
      showEdit = _w[0],
      setShowEdit = _w[1];

  var _x = react_1.useState(null),
      toDelete = _x[0],
      setToDelete = _x[1];

  var _y = react_1.useState(__assign({}, BLANK_FORM)),
      form = _y[0],
      setForm = _y[1];

  var _z = react_1.useState(""),
      assignUserId = _z[0],
      setAssignUserId = _z[1];

  var _0 = react_1.useState("trial"),
      selectedTier = _0[0],
      setSelectedTier = _0[1];

  var _1 = react_1.useState(false),
      showCompose = _1[0],
      setShowCompose = _1[1];

  var _2 = react_1.useState(__assign({}, BLANK_MESSAGE)),
      msgForm = _2[0],
      setMsgForm = _2[1];

  var _3 = react_1.useState(null),
      expandedMsg = _3[0],
      setExpandedMsg = _3[1];

  var _4 = react_1.useState(""),
      adminSearch = _4[0],
      setAdminSearch = _4[1];

  var _5a = react_1.useState("update"),
      editAdminMode = _5a[0],
      setEditAdminMode = _5a[1];

  var _5b = react_1.useState(""),
      editAdminName = _5b[0],
      setEditAdminName = _5b[1];

  var _5c = react_1.useState(""),
      editAdminEmail = _5c[0],
      setEditAdminEmail = _5c[1];

  var _5d = react_1.useState(""),
      editAdminPassword = _5d[0],
      setEditAdminPassword = _5d[1];

  var _5e = react_1.useState(""),
      editAssignUserId = _5e[0],
      setEditAssignUserId = _5e[1]; // populate edit form when org detail loads


  react_1.useEffect(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;

    if (showEdit && (orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.organization)) {
      var o = orgDetail.organization;
      setForm({
        name: (_a = o.name) !== null && _a !== void 0 ? _a : "",
        slug: (_b = o.slug) !== null && _b !== void 0 ? _b : "",
        plan: (_c = o.plan) !== null && _c !== void 0 ? _c : "trial",
        maxUsers: (_d = o.maxUsers) !== null && _d !== void 0 ? _d : 10,
        contactEmail: (_e = o.contactEmail) !== null && _e !== void 0 ? _e : "",
        contactPhone: (_f = o.contactPhone) !== null && _f !== void 0 ? _f : "",
        domain: (_g = o.domain) !== null && _g !== void 0 ? _g : "",
        country: (_h = o.country) !== null && _h !== void 0 ? _h : "",
        address: (_j = o.address) !== null && _j !== void 0 ? _j : "",
        adminMode: "create",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        existingUserId: ""
      }); // Populate super admin fields

      var users = (orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.users) || [];
      var superAdmin = users.find(function (u) {
        return u.role === "super_admin";
      });

      if (superAdmin) {
        setEditAdminMode("update");
        setEditAdminName(superAdmin.name || "");
        setEditAdminEmail(superAdmin.email || "");
      } else {
        setEditAdminMode("create");
        setEditAdminName("");
        setEditAdminEmail("");
      }

      setEditAdminPassword("");
      setEditAssignUserId("");
    }
  }, [showEdit, orgDetail]); // ── Derived ───────────────────────────────────────────────────────────────

  var filtered = orgs.filter(function (o) {
    return !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.includes(search.toLowerCase());
  });
  var totalUsers = orgs.reduce(function (s, o) {
    var _a;

    return s + ((_a = o.userCount) !== null && _a !== void 0 ? _a : 0);
  }, 0);
  var activeCount = orgs.filter(function (o) {
    return o.isActive;
  }).length;
  var moduleListData = trpc_1.trpc.multiTenancy.getModuleList.useQuery().data;
  var modules = (_h = moduleListData === null || moduleListData === void 0 ? void 0 : moduleListData.modules) !== null && _h !== void 0 ? _h : [];
  var currentTierFeatures = (_j = tierMap[selectedTier]) !== null && _j !== void 0 ? _j : {};
  var filteredAdmins = react_1.useMemo(function () {
    if (!adminSearch) return tenantAdmins;
    var s = adminSearch.toLowerCase();
    return tenantAdmins.filter(function (a) {
      var _a, _b, _c;

      return ((_a = a.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(s)) || ((_b = a.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(s)) || ((_c = a.organizationName) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(s));
    });
  }, [tenantAdmins, adminSearch]); // ── Form helpers ──────────────────────────────────────────────────────────

  function handleCreateSubmit() {
    createOrgWithAdmin.mutate({
      name: form.name,
      slug: form.slug,
      plan: form.plan,
      maxUsers: Number(form.maxUsers),
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      domain: form.domain || undefined,
      country: form.country || undefined,
      address: form.address || undefined,
      adminMode: form.adminMode,
      adminName: form.adminMode === "create" ? form.adminName || undefined : undefined,
      adminEmail: form.adminMode === "create" ? form.adminEmail || undefined : undefined,
      adminPassword: form.adminMode === "create" ? form.adminPassword || undefined : undefined,
      existingUserId: form.adminMode === "assign" ? form.existingUserId || undefined : undefined
    });
  }

  function handleEditSubmit() {
    if (!selectedOrgId) return;
    updateOrg.mutate({
      id: selectedOrgId,
      name: form.name,
      plan: form.plan,
      maxUsers: Number(form.maxUsers),
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      domain: form.domain || undefined,
      country: form.country || undefined,
      address: form.address || undefined
    }); // Handle admin changes

    var users = (orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.users) || [];
    var superAdmin = users.find(function (u) {
      return u.role === "super_admin";
    });

    if (editAdminMode === "update" && superAdmin) {
      var hasChanges = editAdminName && editAdminName !== superAdmin.name || editAdminEmail && editAdminEmail !== superAdmin.email || editAdminPassword;

      if (hasChanges) {
        updateOrgAdmin.mutate({
          organizationId: selectedOrgId,
          mode: "update",
          adminUserId: superAdmin.id,
          adminName: editAdminName || undefined,
          adminEmail: editAdminEmail || undefined,
          adminPassword: editAdminPassword || undefined
        });
      }
    } else if (editAdminMode === "create" && editAdminName && editAdminEmail && editAdminPassword) {
      updateOrgAdmin.mutate({
        organizationId: selectedOrgId,
        mode: "create",
        adminName: editAdminName,
        adminEmail: editAdminEmail,
        adminPassword: editAdminPassword
      });
    } else if (editAdminMode === "assign" && editAssignUserId) {
      updateOrgAdmin.mutate({
        organizationId: selectedOrgId,
        mode: "assign",
        existingUserId: editAssignUserId
      });
    }
  }

  function handleToggleFeature(key, current) {
    if (!selectedOrgId) return;
    setFeature.mutate({
      organizationId: selectedOrgId,
      featureKey: key,
      isEnabled: !Boolean(current)
    });
  }

  function handleEnableAll(enable) {
    if (!selectedOrgId) return;
    var all = {};
    modules.forEach(function (m) {
      all[m.key] = Boolean(enable);
    });
    bulkSetFeatures.mutate({
      organizationId: selectedOrgId,
      features: all
    });
  }

  function handleAssignUser() {
    if (!assignUserId || !selectedOrgId) return;
    assignUser.mutate({
      userId: assignUserId,
      organizationId: selectedOrgId
    });
    setAssignUserId("");
  }

  function handleRemoveUser(userId) {
    assignUser.mutate({
      userId: userId,
      organizationId: null
    });
  }

  function handleSaveTierFeatures(features) {
    var coerced = Object.fromEntries(Object.entries(features).map(function (_a) {
      var k = _a[0],
          v = _a[1];
      return [k, Boolean(v)];
    }));
    bulkSetTierFeatures.mutate({
      tier: selectedTier,
      features: coerced
    });
  }

  function handleApplyTier(orgId, tier) {
    applyTierToOrg.mutate({
      organizationId: orgId,
      tier: tier
    });
  }

  function handleSendMessage() {
    sendMessage.mutate({
      subject: msgForm.subject,
      content: msgForm.content,
      priority: msgForm.priority,
      targetType: msgForm.targetType,
      targetOrgId: msgForm.targetOrgId || undefined,
      targetUserId: msgForm.targetUserId || undefined
    });
  }

  var createFormValid = form.name && form.slug && (form.adminMode === "create" ? form.adminName && form.adminEmail && form.adminPassword && form.adminPassword.length >= 8 : form.existingUserId); // ─────────────────────────────────────────────────────────────────────────

  return React.createElement(ModuleLayout_1.ModuleLayout, {
    title: "Multi-Tenancy Management",
    description: "Manage organizations, pricing, admins, and communications"
  }, React.createElement("div", {
    className: "space-y-6"
  }, React.createElement(tabs_1.Tabs, {
    value: mainTab,
    onValueChange: setMainTab
  }, React.createElement(tabs_1.TabsList, {
    className: "grid w-full grid-cols-4"
  }, React.createElement(tabs_1.TabsTrigger, {
    value: "organizations",
    className: "gap-1.5"
  }, React.createElement(lucide_react_1.Building2, {
    className: "h-4 w-4"
  }), " Organizations"), React.createElement(tabs_1.TabsTrigger, {
    value: "pricing",
    className: "gap-1.5"
  }, React.createElement(lucide_react_1.CreditCard, {
    className: "h-4 w-4"
  }), " Pricing Tiers"), React.createElement(tabs_1.TabsTrigger, {
    value: "admins",
    className: "gap-1.5"
  }, React.createElement(lucide_react_1.Shield, {
    className: "h-4 w-4"
  }), " Tenant Admins"), React.createElement(tabs_1.TabsTrigger, {
    value: "comms",
    className: "gap-1.5"
  }, React.createElement(lucide_react_1.MessageSquare, {
    className: "h-4 w-4"
  }), " Communications")), React.createElement(tabs_1.TabsContent, {
    value: "organizations",
    className: "mt-6 space-y-6"
  }, React.createElement("div", {
    className: "grid grid-cols-2 gap-4 sm:grid-cols-4"
  }, [{
    label: "Total Organizations",
    value: orgs.length,
    icon: React.createElement(lucide_react_1.Building2, {
      className: "h-5 w-5 text-muted-foreground"
    })
  }, {
    label: "Active",
    value: activeCount,
    icon: React.createElement(lucide_react_1.CheckCircle2, {
      className: "h-5 w-5 text-green-500"
    })
  }, {
    label: "Total Users",
    value: totalUsers,
    icon: React.createElement(lucide_react_1.Users, {
      className: "h-5 w-5 text-blue-500"
    })
  }, {
    label: "Modules Available",
    value: modules.length,
    icon: React.createElement(lucide_react_1.LayoutGrid, {
      className: "h-5 w-5 text-violet-500"
    })
  }].map(function (s) {
    return React.createElement(card_1.Card, {
      key: s.label
    }, React.createElement(card_1.CardContent, {
      className: "flex items-center gap-3 pt-5"
    }, s.icon, React.createElement("div", null, React.createElement("p", {
      className: "text-2xl font-bold"
    }, listLoading ? "…" : s.value), React.createElement("p", {
      className: "text-xs text-muted-foreground"
    }, s.label))));
  })), React.createElement("div", {
    className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  }, React.createElement("div", {
    className: "relative w-full sm:w-64"
  }, React.createElement(lucide_react_1.Search, {
    className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
  }), React.createElement(input_1.Input, {
    className: "pl-9",
    placeholder: "Search organizations\u2026",
    value: search,
    onChange: function onChange(e) {
      return setSearch(e.target.value);
    }
  })), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(button_1.Button, {
    variant: "outline",
    size: "sm",
    onClick: function onClick() {
      return refetchList();
    }
  }, React.createElement(lucide_react_1.RefreshCw, {
    className: "mr-1.5 h-4 w-4"
  }), " Refresh"), React.createElement(button_1.Button, {
    size: "sm",
    onClick: function onClick() {
      setForm(__assign({}, BLANK_FORM));
      setShowCreate(true);
    }
  }, React.createElement(lucide_react_1.Plus, {
    className: "mr-1.5 h-4 w-4"
  }), " New Organization"))), listLoading ? React.createElement("div", {
    className: "flex items-center justify-center py-20"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-8 w-8 animate-spin text-muted-foreground"
  })) : filtered.length === 0 ? React.createElement(card_1.Card, null, React.createElement(card_1.CardContent, {
    className: "flex flex-col items-center gap-3 py-16 text-center text-muted-foreground"
  }, React.createElement(lucide_react_1.Building2, {
    className: "h-12 w-12 opacity-30"
  }), React.createElement("p", {
    className: "text-sm"
  }, search ? "No organizations match your search." : "No organizations yet. Create one to get started."))) : React.createElement("div", {
    className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
  }, filtered.map(function (org) {
    var _a, _b;

    return React.createElement(card_1.Card, {
      key: org.id,
      className: "cursor-pointer transition-shadow hover:shadow-md " + (selectedOrgId === org.id ? "ring-2 ring-primary" : ""),
      onClick: function onClick() {
        return setSelectedOrgId(org.id === selectedOrgId ? null : org.id);
      }
    }, React.createElement(card_1.CardHeader, {
      className: "pb-2"
    }, React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement(card_1.CardTitle, {
      className: "truncate text-base"
    }, org.name), React.createElement(card_1.CardDescription, {
      className: "truncate text-xs"
    }, org.slug)), org.isActive ? React.createElement(lucide_react_1.CheckCircle2, {
      className: "h-4 w-4 text-green-500 shrink-0"
    }) : React.createElement(lucide_react_1.XCircle, {
      className: "h-4 w-4 text-red-400 shrink-0"
    }))), React.createElement(card_1.CardContent, {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, planBadge(org.plan), React.createElement("span", {
      className: "text-xs text-muted-foreground"
    }, (_a = org.userCount) !== null && _a !== void 0 ? _a : 0, " users"), React.createElement("span", {
      className: "text-xs text-muted-foreground"
    }, (_b = org.featureCount) !== null && _b !== void 0 ? _b : 0, " features")), org.contactEmail && React.createElement("p", {
      className: "truncate text-xs text-muted-foreground"
    }, org.contactEmail), React.createElement("p", {
      className: "text-xs text-muted-foreground"
    }, "Created ", fmt(org.createdAt)), React.createElement("div", {
      className: "flex gap-2 pt-1"
    }, React.createElement(button_1.Button, {
      size: "sm",
      variant: "outline",
      className: "flex-1 text-xs",
      onClick: function onClick(e) {
        e.stopPropagation();
        setSelectedOrgId(org.id);
        setShowEdit(true);
      }
    }, React.createElement(lucide_react_1.Pencil, {
      className: "mr-1 h-3 w-3"
    }), " Edit"), React.createElement(button_1.Button, {
      size: "sm",
      variant: "outline",
      className: "text-xs",
      onClick: function onClick(e) {
        e.stopPropagation();
        handleApplyTier(org.id, org.plan);
      },
      disabled: applyTierToOrg.isPending
    }, React.createElement(lucide_react_1.CreditCard, {
      className: "mr-1 h-3 w-3"
    }), " Apply Tier"), React.createElement(button_1.Button, {
      size: "sm",
      variant: "destructive",
      className: "text-xs",
      onClick: function onClick(e) {
        e.stopPropagation();
        setToDelete(org);
      }
    }, React.createElement(lucide_react_1.Trash2, {
      className: "h-3 w-3"
    })))));
  })), selectedOrgId && React.createElement(card_1.Card, {
    className: "mt-2"
  }, React.createElement(card_1.CardHeader, null, React.createElement(card_1.CardTitle, {
    className: "flex items-center gap-2"
  }, React.createElement(lucide_react_1.Building2, {
    className: "h-5 w-5"
  }), " ", detailLoading ? "Loading…" : (_k = orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.organization) === null || _k === void 0 ? void 0 : _k.name), React.createElement(card_1.CardDescription, null, "Manage features, members, and details for this organization")), React.createElement(card_1.CardContent, null, detailLoading ? React.createElement("div", {
    className: "flex items-center justify-center py-12"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-6 w-6 animate-spin text-muted-foreground"
  })) : React.createElement(tabs_1.Tabs, {
    defaultValue: "features"
  }, React.createElement(tabs_1.TabsList, null, React.createElement(tabs_1.TabsTrigger, {
    value: "features"
  }, "Module Access"), React.createElement(tabs_1.TabsTrigger, {
    value: "members"
  }, "Members"), React.createElement(tabs_1.TabsTrigger, {
    value: "info"
  }, "Details")), React.createElement(tabs_1.TabsContent, {
    value: "features",
    className: "mt-4"
  }, React.createElement("div", {
    className: "mb-3 flex items-center justify-between"
  }, React.createElement("p", {
    className: "text-sm text-muted-foreground"
  }, "Toggle which modules are available."), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(button_1.Button, {
    size: "sm",
    variant: "outline",
    onClick: function onClick() {
      return handleEnableAll(true);
    },
    disabled: bulkSetFeatures.isPending
  }, "Enable All"), React.createElement(button_1.Button, {
    size: "sm",
    variant: "outline",
    onClick: function onClick() {
      return handleEnableAll(false);
    },
    disabled: bulkSetFeatures.isPending
  }, "Disable All"))), featuresLoading ? React.createElement("div", {
    className: "flex justify-center py-8"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-5 w-5 animate-spin"
  })) : React.createElement("div", {
    className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  }, modules.map(function (mod) {
    var enabled = featureMap[mod.key] !== false;
    return React.createElement("div", {
      key: mod.key,
      className: "flex items-start gap-3 rounded-lg border p-3 transition-colors " + (enabled ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "opacity-60")
    }, React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return handleToggleFeature(mod.key, enabled);
      },
      disabled: setFeature.isPending,
      className: "mt-0.5 shrink-0"
    }, enabled ? React.createElement(lucide_react_1.ToggleRight, {
      className: "h-5 w-5 text-green-600"
    }) : React.createElement(lucide_react_1.ToggleLeft, {
      className: "h-5 w-5 text-muted-foreground"
    })), React.createElement("div", {
      className: "min-w-0"
    }, React.createElement("p", {
      className: "text-sm font-medium leading-tight"
    }, mod.label), React.createElement("p", {
      className: "mt-0.5 text-xs text-muted-foreground leading-snug"
    }, mod.description)));
  }))), React.createElement(tabs_1.TabsContent, {
    value: "members",
    className: "mt-4 space-y-4"
  }, React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(select_1.Select, {
    value: assignUserId,
    onValueChange: setAssignUserId
  }, React.createElement(select_1.SelectTrigger, {
    className: "flex-1"
  }, React.createElement(select_1.SelectValue, {
    placeholder: "Select user to assign\u2026"
  })), React.createElement(select_1.SelectContent, null, allUsers.filter(function (u) {
    return u.organizationId !== selectedOrgId;
  }).map(function (u) {
    return React.createElement(select_1.SelectItem, {
      key: u.id,
      value: u.id
    }, u.name, " (", u.email, ")");
  }))), React.createElement(button_1.Button, {
    onClick: handleAssignUser,
    disabled: !assignUserId || assignUser.isPending
  }, React.createElement(lucide_react_1.UserPlus, {
    className: "mr-1.5 h-4 w-4"
  }), " Assign")), orgUsers.length === 0 ? React.createElement("p", {
    className: "py-6 text-center text-sm text-muted-foreground"
  }, "No users assigned.") : React.createElement("div", {
    className: "divide-y rounded-lg border"
  }, orgUsers.map(function (u) {
    return React.createElement("div", {
      key: u.id,
      className: "flex items-center gap-3 px-4 py-3"
    }, React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("p", {
      className: "truncate text-sm font-medium"
    }, u.name), React.createElement("p", {
      className: "truncate text-xs text-muted-foreground"
    }, u.email)), React.createElement(badge_1.Badge, {
      variant: "secondary",
      className: "shrink-0 capitalize text-xs"
    }, u.role), u.role === "super_admin" && React.createElement(lucide_react_1.Crown, {
      className: "h-4 w-4 text-yellow-500 shrink-0"
    }), React.createElement(button_1.Button, {
      size: "sm",
      variant: "ghost",
      className: "shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50",
      onClick: function onClick() {
        return handleRemoveUser(u.id);
      },
      disabled: assignUser.isPending
    }, React.createElement(lucide_react_1.XCircle, {
      className: "h-4 w-4"
    })));
  }))), React.createElement(tabs_1.TabsContent, {
    value: "info",
    className: "mt-4"
  }, (orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.organization) && function () {
    var o = orgDetail.organization;
    return React.createElement("dl", {
      className: "grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2"
    }, [["ID", o.id], ["Slug", o.slug], ["Plan", planBadge(o.plan)], ["Max Users", o.maxUsers === -1 ? "Unlimited" : o.maxUsers], ["Status", o.isActive ? "Active" : "Inactive"], ["Contact Email", o.contactEmail || "\u2014"], ["Contact Phone", o.contactPhone || "\u2014"], ["Domain", o.domain || "\u2014"], ["Country", o.country || "\u2014"], ["Created", fmt(o.createdAt)], ["Last Updated", fmt(o.updatedAt)]].map(function (_a) {
      var k = _a[0],
          v = _a[1];
      return React.createElement("div", {
        key: String(k),
        className: "flex flex-col gap-0.5"
      }, React.createElement("dt", {
        className: "text-xs text-muted-foreground"
      }, k), React.createElement("dd", {
        className: "font-medium"
      }, v));
    }), o.address && React.createElement("div", {
      className: "sm:col-span-2 flex flex-col gap-0.5"
    }, React.createElement("dt", {
      className: "text-xs text-muted-foreground"
    }, "Address"), React.createElement("dd", {
      className: "font-medium"
    }, o.address)));
  }()))))), React.createElement(tabs_1.TabsContent, {
    value: "pricing",
    className: "mt-6 space-y-6"
  }, React.createElement(card_1.Card, null, React.createElement(card_1.CardHeader, null, React.createElement(card_1.CardTitle, {
    className: "flex items-center gap-2"
  }, React.createElement(lucide_react_1.CreditCard, {
    className: "h-5 w-5"
  }), " Pricing Tier Feature Configuration"), React.createElement(card_1.CardDescription, null, "Define which modules are included in each pricing tier. Tier features are auto-applied when creating organizations.")), React.createElement(card_1.CardContent, {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  }, React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement(label_1.Label, {
    className: "text-sm font-medium"
  }, "Select Tier:"), React.createElement("div", {
    className: "flex gap-1"
  }, PLAN_OPTIONS.map(function (tier) {
    return React.createElement(button_1.Button, {
      key: tier,
      size: "sm",
      variant: selectedTier === tier ? "default" : "outline",
      className: "capitalize",
      onClick: function onClick() {
        return setSelectedTier(tier);
      }
    }, tier);
  }))), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(button_1.Button, {
    size: "sm",
    variant: "outline",
    disabled: bulkSetTierFeatures.isPending,
    onClick: function onClick() {
      var all = {};
      modules.forEach(function (m) {
        all[m.key] = true;
      });
      handleSaveTierFeatures(all);
    }
  }, "Enable All"), React.createElement(button_1.Button, {
    size: "sm",
    variant: "outline",
    disabled: bulkSetTierFeatures.isPending,
    onClick: function onClick() {
      var all = {};
      modules.forEach(function (m) {
        all[m.key] = false;
      });
      handleSaveTierFeatures(all);
    }
  }, "Disable All"))), React.createElement("div", {
    className: "rounded-lg border bg-muted/30 p-3"
  }, React.createElement("p", {
    className: "text-sm"
  }, selectedTier === "trial" && "Free Trial \u2014 Limited features for evaluation. 14-day access, basic modules only.", selectedTier === "starter" && "Starter Plan \u2014 Essential CRM features for small businesses. Up to 10 users.", selectedTier === "professional" && "Professional Plan \u2014 Full CRM suite with advanced features. Up to 50 users.", selectedTier === "enterprise" && "Enterprise Plan \u2014 All features unlocked, unlimited users, dedicated support.", selectedTier === "custom" && "Custom Plan \u2014 Bespoke feature combination tailored to specific requirements.")), tiersLoading ? React.createElement("div", {
    className: "flex justify-center py-8"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-5 w-5 animate-spin"
  })) : React.createElement("div", {
    className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  }, modules.map(function (mod) {
    var _a;

    var enabled = (_a = currentTierFeatures[mod.key]) !== null && _a !== void 0 ? _a : false;
    return React.createElement("div", {
      key: mod.key,
      className: "flex items-start gap-3 rounded-lg border p-3 transition-colors " + (enabled ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "opacity-60")
    }, React.createElement("button", {
      type: "button",
      disabled: bulkSetTierFeatures.isPending,
      className: "mt-0.5 shrink-0",
      onClick: function onClick() {
        var _a;

        var updated = __assign(__assign({}, currentTierFeatures), (_a = {}, _a[mod.key] = !enabled, _a));

        handleSaveTierFeatures(updated);
      }
    }, enabled ? React.createElement(lucide_react_1.ToggleRight, {
      className: "h-5 w-5 text-green-600"
    }) : React.createElement(lucide_react_1.ToggleLeft, {
      className: "h-5 w-5 text-muted-foreground"
    })), React.createElement("div", {
      className: "min-w-0"
    }, React.createElement("p", {
      className: "text-sm font-medium leading-tight"
    }, mod.label), React.createElement("p", {
      className: "mt-0.5 text-xs text-muted-foreground leading-snug"
    }, mod.description)));
  })), React.createElement("div", {
    className: "mt-6"
  }, React.createElement("h3", {
    className: "mb-3 text-sm font-semibold"
  }, "Tier Comparison"), React.createElement("div", {
    className: "overflow-x-auto rounded-lg border"
  }, React.createElement("table", {
    className: "w-full text-sm"
  }, React.createElement("thead", {
    className: "bg-muted/50"
  }, React.createElement("tr", null, React.createElement("th", {
    className: "px-3 py-2 text-left font-medium"
  }, "Module"), PLAN_OPTIONS.map(function (t) {
    return React.createElement("th", {
      key: t,
      className: "px-3 py-2 text-center font-medium capitalize"
    }, t);
  }))), React.createElement("tbody", {
    className: "divide-y"
  }, modules.map(function (mod) {
    return React.createElement("tr", {
      key: mod.key,
      className: "hover:bg-muted/30"
    }, React.createElement("td", {
      className: "px-3 py-2 font-medium"
    }, mod.label), PLAN_OPTIONS.map(function (t) {
      var _a;

      return React.createElement("td", {
        key: t,
        className: "px-3 py-2 text-center"
      }, ((_a = tierMap[t]) === null || _a === void 0 ? void 0 : _a[mod.key]) ? React.createElement(lucide_react_1.CheckCircle2, {
        className: "mx-auto h-4 w-4 text-green-500"
      }) : React.createElement(lucide_react_1.XCircle, {
        className: "mx-auto h-4 w-4 text-gray-300"
      }));
    }));
  })), React.createElement("tfoot", {
    className: "bg-muted/30"
  }, React.createElement("tr", null, React.createElement("td", {
    className: "px-3 py-2 font-semibold"
  }, "Total Features"), PLAN_OPTIONS.map(function (t) {
    var _a;

    return React.createElement("td", {
      key: t,
      className: "px-3 py-2 text-center font-semibold"
    }, Object.values((_a = tierMap[t]) !== null && _a !== void 0 ? _a : {}).filter(Boolean).length);
  }))))))))), React.createElement(tabs_1.TabsContent, {
    value: "admins",
    className: "mt-6 space-y-6"
  }, React.createElement(card_1.Card, null, React.createElement(card_1.CardHeader, null, React.createElement(card_1.CardTitle, {
    className: "flex items-center gap-2"
  }, React.createElement(lucide_react_1.Shield, {
    className: "h-5 w-5"
  }), " Tenant Super Admins"), React.createElement(card_1.CardDescription, null, "All organization super administrators in one place for easy accessibility, communication & updates.")), React.createElement(card_1.CardContent, {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  }, React.createElement("div", {
    className: "relative w-full sm:w-64"
  }, React.createElement(lucide_react_1.Search, {
    className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
  }), React.createElement(input_1.Input, {
    className: "pl-9",
    placeholder: "Search admins\u2026",
    value: adminSearch,
    onChange: function onChange(e) {
      return setAdminSearch(e.target.value);
    }
  })), React.createElement(badge_1.Badge, {
    variant: "secondary",
    className: "w-fit"
  }, tenantAdmins.length, " admin", tenantAdmins.length !== 1 ? "s" : "", " total")), adminsLoading ? React.createElement("div", {
    className: "flex justify-center py-8"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-5 w-5 animate-spin"
  })) : filteredAdmins.length === 0 ? React.createElement("div", {
    className: "flex flex-col items-center gap-2 py-12 text-center text-muted-foreground"
  }, React.createElement(lucide_react_1.Shield, {
    className: "h-10 w-10 opacity-30"
  }), React.createElement("p", {
    className: "text-sm"
  }, adminSearch ? "No admins match your search." : "No tenant admins found.")) : React.createElement("div", {
    className: "divide-y rounded-lg border"
  }, filteredAdmins.map(function (admin) {
    var _a, _b, _c;

    return React.createElement("div", {
      key: admin.id,
      className: "flex items-center gap-4 px-4 py-3 hover:bg-muted/30"
    }, React.createElement("div", {
      className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0"
    }, (_c = (_b = (_a = admin.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) !== null && _c !== void 0 ? _c : "?"), React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("p", {
      className: "truncate text-sm font-medium"
    }, admin.name), React.createElement(lucide_react_1.Crown, {
      className: "h-3.5 w-3.5 text-yellow-500 shrink-0"
    })), React.createElement("p", {
      className: "truncate text-xs text-muted-foreground"
    }, admin.email)), React.createElement("div", {
      className: "text-right shrink-0"
    }, React.createElement("p", {
      className: "text-sm font-medium"
    }, admin.organizationName), React.createElement("div", {
      className: "flex items-center gap-1.5 justify-end"
    }, React.createElement("span", {
      className: "text-xs text-muted-foreground"
    }, admin.organizationSlug), planBadge(admin.organizationPlan))), React.createElement("div", {
      className: "shrink-0"
    }, admin.isActive ? React.createElement(badge_1.Badge, {
      className: "bg-green-100 text-green-800 text-xs"
    }, "Active") : React.createElement(badge_1.Badge, {
      variant: "secondary",
      className: "text-xs"
    }, "Inactive")), React.createElement(button_1.Button, {
      size: "sm",
      variant: "outline",
      className: "shrink-0",
      onClick: function onClick() {
        setMsgForm(__assign(__assign({}, BLANK_MESSAGE), {
          targetType: "specific_user",
          targetUserId: admin.id,
          subject: "Message to " + admin.name
        }));
        setShowCompose(true);
      }
    }, React.createElement(lucide_react_1.Mail, {
      className: "h-3.5 w-3.5"
    })));
  }))))), React.createElement(tabs_1.TabsContent, {
    value: "comms",
    className: "mt-6 space-y-6"
  }, React.createElement(card_1.Card, null, React.createElement(card_1.CardHeader, null, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("div", null, React.createElement(card_1.CardTitle, {
    className: "flex items-center gap-2"
  }, React.createElement(lucide_react_1.MessageSquare, {
    className: "h-5 w-5"
  }), " Tenant Communications"), React.createElement(card_1.CardDescription, null, "Send announcements, updates, and messages to organization super admins.")), React.createElement(button_1.Button, {
    onClick: function onClick() {
      setMsgForm(__assign({}, BLANK_MESSAGE));
      setShowCompose(true);
    }
  }, React.createElement(lucide_react_1.Plus, {
    className: "mr-1.5 h-4 w-4"
  }), " New Message"))), React.createElement(card_1.CardContent, null, messagesLoading ? React.createElement("div", {
    className: "flex justify-center py-8"
  }, React.createElement(lucide_react_1.Loader2, {
    className: "h-5 w-5 animate-spin"
  })) : messages.length === 0 ? React.createElement("div", {
    className: "flex flex-col items-center gap-2 py-12 text-center text-muted-foreground"
  }, React.createElement(lucide_react_1.MessageSquare, {
    className: "h-10 w-10 opacity-30"
  }), React.createElement("p", {
    className: "text-sm"
  }, "No messages yet. Send your first communication.")) : React.createElement("div", {
    className: "space-y-3"
  }, messages.map(function (msg) {
    var _a, _b;

    return React.createElement("div", {
      key: msg.id,
      className: "cursor-pointer rounded-lg border p-4 hover:bg-muted/30 transition-colors",
      onClick: function onClick() {
        return setExpandedMsg(expandedMsg === msg.id ? null : msg.id);
      }
    }, React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("div", {
      className: "flex items-center gap-2 mb-1"
    }, React.createElement("p", {
      className: "text-sm font-semibold"
    }, msg.subject), React.createElement("span", {
      className: "inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize " + ((_a = PRIORITY_COLORS[msg.priority]) !== null && _a !== void 0 ? _a : "")
    }, msg.priority)), React.createElement("div", {
      className: "flex items-center gap-2 text-xs text-muted-foreground"
    }, React.createElement("span", null, fmtFull(msg.createdAt)), React.createElement("span", null, "\\u2022"), React.createElement("span", {
      className: "capitalize"
    }, (_b = msg.targetType) === null || _b === void 0 ? void 0 : _b.replace(/_/g, " ")), msg.isRead ? React.createElement(badge_1.Badge, {
      variant: "secondary",
      className: "text-xs"
    }, "Read") : React.createElement(badge_1.Badge, {
      className: "bg-blue-100 text-blue-800 text-xs"
    }, "Unread"))), React.createElement(lucide_react_1.Eye, {
      className: "h-4 w-4 text-muted-foreground shrink-0 mt-1"
    })), expandedMsg === msg.id && React.createElement("div", {
      className: "mt-3 rounded-lg bg-muted/30 p-3 text-sm whitespace-pre-wrap"
    }, msg.content));
  }))))))), React.createElement(dialog_1.Dialog, {
    open: showCreate,
    onOpenChange: setShowCreate
  }, React.createElement(dialog_1.DialogContent, {
    className: "max-w-xl max-h-[90vh] overflow-y-auto"
  }, React.createElement(dialog_1.DialogHeader, null, React.createElement(dialog_1.DialogTitle, null, "Create Organization"), React.createElement(dialog_1.DialogDescription, null, "Add a new tenant organization with its super administrator.")), React.createElement(OrgFormWithAdmin, {
    form: form,
    setForm: setForm,
    allUsers: allUsers
  }), React.createElement(dialog_1.DialogFooter, null, React.createElement(button_1.Button, {
    variant: "outline",
    onClick: function onClick() {
      return setShowCreate(false);
    }
  }, "Cancel"), React.createElement(button_1.Button, {
    onClick: handleCreateSubmit,
    disabled: createOrgWithAdmin.isPending || !createFormValid
  }, createOrgWithAdmin.isPending && React.createElement(lucide_react_1.Loader2, {
    className: "mr-2 h-4 w-4 animate-spin"
  }), "Create Organization")))), React.createElement(dialog_1.Dialog, {
    open: showEdit,
    onOpenChange: setShowEdit
  }, React.createElement(dialog_1.DialogContent, {
    className: "max-w-lg"
  }, React.createElement(dialog_1.DialogHeader, null, React.createElement(dialog_1.DialogTitle, null, "Edit Organization"), React.createElement(dialog_1.DialogDescription, null, "Update organization details.")), React.createElement(OrgFormBasic, {
    form: form,
    setForm: setForm,
    mode: "edit"
  }), React.createElement("div", {
    className: "border-t pt-4 mt-4 space-y-4"
  }, React.createElement("h4", {
    className: "text-sm font-semibold flex items-center gap-2"
  }, React.createElement(lucide_react_1.Shield, {
    className: "h-4 w-4"
  }), "Organization Super Admin"), function () {
    var users = (orgDetail === null || orgDetail === void 0 ? void 0 : orgDetail.users) || [];
    var superAdmin = users.find(function (u) {
      return u.role === "super_admin";
    });
    return React.createElement("div", {
      className: "space-y-3"
    }, superAdmin && React.createElement("div", {
      className: "flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
    }, React.createElement(lucide_react_1.User, {
      className: "h-4 w-4 text-muted-foreground"
    }), React.createElement("span", null, "Current: ", React.createElement("strong", null, superAdmin.name), " (", superAdmin.email, ")")), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Admin Action"), React.createElement(select_1.Select, {
      value: editAdminMode,
      onValueChange: function onValueChange(v) {
        setEditAdminMode(v);
      }
    }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, null)), React.createElement(select_1.SelectContent, null, superAdmin && React.createElement(select_1.SelectItem, {
      value: "update"
    }, "Update Existing Admin"), React.createElement(select_1.SelectItem, {
      value: "create"
    }, "Create New Admin"), React.createElement(select_1.SelectItem, {
      value: "assign"
    }, "Assign Existing User")))), editAdminMode === "update" && superAdmin && React.createElement(React.Fragment, null, React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Name"), React.createElement(input_1.Input, {
      value: editAdminName,
      onChange: function onChange(e) {
        setEditAdminName(e.target.value);
      }
    })), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Email"), React.createElement(input_1.Input, {
      type: "email",
      value: editAdminEmail,
      onChange: function onChange(e) {
        setEditAdminEmail(e.target.value);
      }
    }))), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "New Password (leave blank to keep current)"), React.createElement(input_1.Input, {
      type: "password",
      value: editAdminPassword,
      onChange: function onChange(e) {
        setEditAdminPassword(e.target.value);
      },
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }))), editAdminMode === "create" && React.createElement(React.Fragment, null, React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Admin Name *"), React.createElement(input_1.Input, {
      value: editAdminName,
      onChange: function onChange(e) {
        setEditAdminName(e.target.value);
      },
      placeholder: "John Doe"
    })), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Admin Email *"), React.createElement(input_1.Input, {
      type: "email",
      value: editAdminEmail,
      onChange: function onChange(e) {
        setEditAdminEmail(e.target.value);
      },
      placeholder: "admin@example.com"
    }))), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Password *"), React.createElement(input_1.Input, {
      type: "password",
      value: editAdminPassword,
      onChange: function onChange(e) {
        setEditAdminPassword(e.target.value);
      },
      placeholder: "Minimum 6 characters"
    }))), editAdminMode === "assign" && React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement(label_1.Label, null, "Select User to Promote"), React.createElement(select_1.Select, {
      value: editAssignUserId,
      onValueChange: function onValueChange(v) {
        setEditAssignUserId(v);
      }
    }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, {
      placeholder: "Select a user\u2026"
    })), React.createElement(select_1.SelectContent, null, allUsers.filter(function (u) {
      return !superAdmin || u.id !== superAdmin.id;
    }).map(function (u) {
      return React.createElement(select_1.SelectItem, {
        key: u.id,
        value: u.id
      }, u.name + " (" + u.email + ")");
    })))));
  }()), React.createElement(dialog_1.DialogFooter, null, React.createElement(button_1.Button, {
    variant: "outline",
    onClick: function onClick() {
      return setShowEdit(false);
    }
  }, "Cancel"), React.createElement(button_1.Button, {
    onClick: handleEditSubmit,
    disabled: updateOrg.isPending || !form.name
  }, updateOrg.isPending && React.createElement(lucide_react_1.Loader2, {
    className: "mr-2 h-4 w-4 animate-spin"
  }), "Save Changes")))), React.createElement(dialog_1.Dialog, {
    open: showCompose,
    onOpenChange: setShowCompose
  }, React.createElement(dialog_1.DialogContent, {
    className: "max-w-lg"
  }, React.createElement(dialog_1.DialogHeader, null, React.createElement(dialog_1.DialogTitle, {
    className: "flex items-center gap-2"
  }, React.createElement(lucide_react_1.Send, {
    className: "h-5 w-5"
  }), " Compose Message"), React.createElement(dialog_1.DialogDescription, null, "Send a message to tenant super administrators.")), React.createElement("div", {
    className: "space-y-4 py-1"
  }, React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Target Audience"), React.createElement(select_1.Select, {
    value: msgForm.targetType,
    onValueChange: function onValueChange(v) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          targetType: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, null)), React.createElement(select_1.SelectContent, null, React.createElement(select_1.SelectItem, {
    value: "all_admins"
  }, "All Tenant Admins"), React.createElement(select_1.SelectItem, {
    value: "specific_org"
  }, "Specific Organization"), React.createElement(select_1.SelectItem, {
    value: "specific_user"
  }, "Specific User")))), msgForm.targetType === "specific_org" && React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Organization"), React.createElement(select_1.Select, {
    value: msgForm.targetOrgId,
    onValueChange: function onValueChange(v) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          targetOrgId: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, {
    placeholder: "Select organization\u2026"
  })), React.createElement(select_1.SelectContent, null, orgs.map(function (o) {
    return React.createElement(select_1.SelectItem, {
      key: o.id,
      value: o.id
    }, o.name);
  })))), msgForm.targetType === "specific_user" && React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "User"), React.createElement(select_1.Select, {
    value: msgForm.targetUserId,
    onValueChange: function onValueChange(v) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          targetUserId: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, {
    placeholder: "Select user\u2026"
  })), React.createElement(select_1.SelectContent, null, tenantAdmins.map(function (a) {
    return React.createElement(select_1.SelectItem, {
      key: a.id,
      value: a.id
    }, a.name, " (", a.email, ")");
  })))), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Priority"), React.createElement(select_1.Select, {
    value: msgForm.priority,
    onValueChange: function onValueChange(v) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          priority: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, null)), React.createElement(select_1.SelectContent, null, ["low", "normal", "high", "urgent"].map(function (p) {
    return React.createElement(select_1.SelectItem, {
      key: p,
      value: p,
      className: "capitalize"
    }, p);
  })))), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Subject *"), React.createElement(input_1.Input, {
    value: msgForm.subject,
    onChange: function onChange(e) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          subject: e.target.value
        });
      });
    },
    placeholder: "System maintenance notice"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Message *"), React.createElement(textarea_1.Textarea, {
    rows: 5,
    value: msgForm.content,
    onChange: function onChange(e) {
      return setMsgForm(function (p) {
        return __assign(__assign({}, p), {
          content: e.target.value
        });
      });
    },
    placeholder: "Write your message to tenant admins\u2026"
  }))), React.createElement(dialog_1.DialogFooter, null, React.createElement(button_1.Button, {
    variant: "outline",
    onClick: function onClick() {
      return setShowCompose(false);
    }
  }, "Cancel"), React.createElement(button_1.Button, {
    onClick: handleSendMessage,
    disabled: sendMessage.isPending || !msgForm.subject || !msgForm.content
  }, sendMessage.isPending && React.createElement(lucide_react_1.Loader2, {
    className: "mr-2 h-4 w-4 animate-spin"
  }), React.createElement(lucide_react_1.Send, {
    className: "mr-1.5 h-4 w-4"
  }), " Send Message")))), React.createElement(alert_dialog_1.AlertDialog, {
    open: !!toDelete,
    onOpenChange: function onOpenChange(o) {
      if (!o) setToDelete(null);
    }
  }, React.createElement(alert_dialog_1.AlertDialogContent, null, React.createElement(alert_dialog_1.AlertDialogHeader, null, React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete \"", toDelete === null || toDelete === void 0 ? void 0 : toDelete.name, "\"?"), React.createElement(alert_dialog_1.AlertDialogDescription, null, "This will permanently delete the organization and remove all its feature flags. Users will be unlinked but not deleted.")), React.createElement(alert_dialog_1.AlertDialogFooter, null, React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"), React.createElement(alert_dialog_1.AlertDialogAction, {
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    onClick: function onClick() {
      return toDelete && deleteOrg.mutate({
        id: toDelete.id
      });
    }
  }, deleteOrg.isPending ? React.createElement(lucide_react_1.Loader2, {
    className: "mr-2 h-4 w-4 animate-spin"
  }) : null, "Delete Organization")))));
}

exports["default"] = MultiTenancy; // ─── Create form with mandatory super admin ──────────────────────────────────

function OrgFormWithAdmin(_a) {
  var form = _a.form,
      setForm = _a.setForm,
      allUsers = _a.allUsers;

  function f(key) {
    return function (e) {
      return setForm(function (p) {
        var _a;

        return __assign(__assign({}, p), (_a = {}, _a[key] = e.target.value, _a));
      });
    };
  }

  return React.createElement("div", {
    className: "space-y-6 py-1"
  }, React.createElement("div", null, React.createElement("h3", {
    className: "text-sm font-semibold mb-3 flex items-center gap-2"
  }, React.createElement(lucide_react_1.Building2, {
    className: "h-4 w-4"
  }), " Organization Details"), React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Organization Name *"), React.createElement(input_1.Input, {
    value: form.name,
    onChange: function onChange(e) {
      var name = e.target.value;
      setForm(function (p) {
        return __assign(__assign({}, p), {
          name: name,
          slug: slugify(name)
        });
      });
    },
    placeholder: "Acme Corporation"
  })), React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Slug *"), React.createElement(input_1.Input, {
    value: form.slug,
    onChange: f("slug"),
    placeholder: "acme-corporation"
  }), React.createElement("p", {
    className: "text-xs text-muted-foreground"
  }, "Lowercase letters, numbers, hyphens only.")), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Plan"), React.createElement(select_1.Select, {
    value: form.plan,
    onValueChange: function onValueChange(v) {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          plan: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, null)), React.createElement(select_1.SelectContent, null, PLAN_OPTIONS.map(function (p) {
    return React.createElement(select_1.SelectItem, {
      key: p,
      value: p,
      className: "capitalize"
    }, p);
  })))), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Max Users"), React.createElement(input_1.Input, {
    type: "number",
    min: 1,
    value: form.maxUsers,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          maxUsers: Number(e.target.value)
        });
      });
    }
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Contact Email"), React.createElement(input_1.Input, {
    type: "email",
    value: form.contactEmail,
    onChange: f("contactEmail"),
    placeholder: "admin@example.com"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Contact Phone"), React.createElement(input_1.Input, {
    value: form.contactPhone,
    onChange: f("contactPhone"),
    placeholder: "+254 700 000 000"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Domain"), React.createElement(input_1.Input, {
    value: form.domain,
    onChange: f("domain"),
    placeholder: "example.com"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Country"), React.createElement(input_1.Input, {
    value: form.country,
    onChange: f("country"),
    placeholder: "Kenya"
  })), React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Address"), React.createElement(input_1.Input, {
    value: form.address,
    onChange: f("address"),
    placeholder: "123 Main St, Nairobi"
  })))), React.createElement("div", {
    className: "border-t pt-4"
  }, React.createElement("h3", {
    className: "text-sm font-semibold mb-1 flex items-center gap-2"
  }, React.createElement(lucide_react_1.Shield, {
    className: "h-4 w-4"
  }), " Organization Super Admin *"), React.createElement("p", {
    className: "text-xs text-muted-foreground mb-3"
  }, "Every organization requires a super admin. Create a new account or assign an existing user."), React.createElement("div", {
    className: "flex gap-2 mb-4"
  }, React.createElement(button_1.Button, {
    size: "sm",
    variant: form.adminMode === "create" ? "default" : "outline",
    onClick: function onClick() {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          adminMode: "create"
        });
      });
    },
    type: "button"
  }, React.createElement(lucide_react_1.UserPlus, {
    className: "mr-1.5 h-4 w-4"
  }), " Create New Admin"), React.createElement(button_1.Button, {
    size: "sm",
    variant: form.adminMode === "assign" ? "default" : "outline",
    onClick: function onClick() {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          adminMode: "assign"
        });
      });
    },
    type: "button"
  }, React.createElement(lucide_react_1.Users, {
    className: "mr-1.5 h-4 w-4"
  }), " Assign Existing User")), form.adminMode === "create" ? React.createElement("div", {
    className: "grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4"
  }, React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Admin Full Name *"), React.createElement(input_1.Input, {
    value: form.adminName,
    onChange: f("adminName"),
    placeholder: "John Doe"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Admin Email *"), React.createElement(input_1.Input, {
    type: "email",
    value: form.adminEmail,
    onChange: f("adminEmail"),
    placeholder: "john@example.com"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Admin Password *"), React.createElement(input_1.Input, {
    type: "password",
    value: form.adminPassword,
    onChange: f("adminPassword"),
    placeholder: "Min 8 characters"
  }), form.adminPassword && form.adminPassword.length < 8 && React.createElement("p", {
    className: "text-xs text-red-500"
  }, "Password must be at least 8 characters")), React.createElement("div", {
    className: "col-span-2"
  }, React.createElement("div", {
    className: "flex items-start gap-2 rounded bg-blue-50 dark:bg-blue-950/30 p-2.5"
  }, React.createElement(lucide_react_1.AlertCircle, {
    className: "h-4 w-4 text-blue-500 mt-0.5 shrink-0"
  }), React.createElement("p", {
    className: "text-xs text-blue-700 dark:text-blue-300"
  }, "This user will be created as the organization's super admin with full access to all enabled features.")))) : React.createElement("div", {
    className: "rounded-lg border bg-muted/20 p-4 space-y-3"
  }, React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Select Existing User *"), React.createElement(select_1.Select, {
    value: form.existingUserId,
    onValueChange: function onValueChange(v) {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          existingUserId: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, {
    placeholder: "Choose a user to promote\u2026"
  })), React.createElement(select_1.SelectContent, null, allUsers.map(function (u) {
    return React.createElement(select_1.SelectItem, {
      key: u.id,
      value: u.id
    }, u.name, " (", u.email, ") \\u2014 ", u.role);
  })))), React.createElement("div", {
    className: "flex items-start gap-2 rounded bg-amber-50 dark:bg-amber-950/30 p-2.5"
  }, React.createElement(lucide_react_1.AlertCircle, {
    className: "h-4 w-4 text-amber-500 mt-0.5 shrink-0"
  }), React.createElement("p", {
    className: "text-xs text-amber-700 dark:text-amber-300"
  }, "The selected user will be assigned to this organization and promoted to super admin role with full feature access.")))));
} // ─── Basic org form (for editing) ────────────────────────────────────────────


function OrgFormBasic(_a) {
  var form = _a.form,
      setForm = _a.setForm,
      mode = _a.mode;

  function f(key) {
    return function (e) {
      return setForm(function (p) {
        var _a;

        return __assign(__assign({}, p), (_a = {}, _a[key] = e.target.value, _a));
      });
    };
  }

  return React.createElement("div", {
    className: "space-y-4 py-1"
  }, React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Organization Name *"), React.createElement(input_1.Input, {
    value: form.name,
    onChange: function onChange(e) {
      var name = e.target.value;
      setForm(function (p) {
        return __assign(__assign({}, p), {
          name: name,
          slug: mode === "create" ? slugify(name) : p.slug
        });
      });
    },
    placeholder: "Acme Corporation"
  })), mode === "create" && React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Slug *"), React.createElement(input_1.Input, {
    value: form.slug,
    onChange: f("slug"),
    placeholder: "acme-corporation"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Plan"), React.createElement(select_1.Select, {
    value: form.plan,
    onValueChange: function onValueChange(v) {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          plan: v
        });
      });
    }
  }, React.createElement(select_1.SelectTrigger, null, React.createElement(select_1.SelectValue, null)), React.createElement(select_1.SelectContent, null, PLAN_OPTIONS.map(function (p) {
    return React.createElement(select_1.SelectItem, {
      key: p,
      value: p,
      className: "capitalize"
    }, p);
  })))), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Max Users"), React.createElement(input_1.Input, {
    type: "number",
    min: 1,
    value: form.maxUsers,
    onChange: function onChange(e) {
      return setForm(function (p) {
        return __assign(__assign({}, p), {
          maxUsers: Number(e.target.value)
        });
      });
    }
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Contact Email"), React.createElement(input_1.Input, {
    type: "email",
    value: form.contactEmail,
    onChange: f("contactEmail"),
    placeholder: "admin@example.com"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Contact Phone"), React.createElement(input_1.Input, {
    value: form.contactPhone,
    onChange: f("contactPhone"),
    placeholder: "+254 700 000 000"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Domain"), React.createElement(input_1.Input, {
    value: form.domain,
    onChange: f("domain"),
    placeholder: "example.com"
  })), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement(label_1.Label, null, "Country"), React.createElement(input_1.Input, {
    value: form.country,
    onChange: f("country"),
    placeholder: "Kenya"
  })), React.createElement("div", {
    className: "col-span-2 space-y-1.5"
  }, React.createElement(label_1.Label, null, "Address"), React.createElement(input_1.Input, {
    value: form.address,
    onChange: f("address"),
    placeholder: "123 Main St, Nairobi"
  }))));
}