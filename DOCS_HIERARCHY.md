# 📚 Documentation Hierarchy - Values.md Project

This document establishes the clear authority hierarchy and purpose of all documentation files in the project.

## 🚨 **DOCUMENTATION CLEANUP NEEDED**

**CURRENT STATE**: 13+ .md files in project root - causing confusion and contradictions

**CRITICAL ISSUE**: Multiple overlapping documentation files with unclear authority

## 🎯 **PRIMARY AUTHORITY** (Keep These)

### 1. **CLAUDE.md** ⭐ *MASTER AUTHORITY*
**Purpose**: Technical architecture and development guidelines  
**Authority**: Highest - All technical decisions reference this  
**Audience**: Developers, Claude Code, technical contributors  
**Scope**: Project structure, tech stack, database schema, development workflows
**Status**: ✅ Keep - Essential

### 2. **README.md** ⭐ *USER ENTRY POINT*  
**Purpose**: Project overview and quick start guide  
**Authority**: High - First impression and primary reference  
**Audience**: New users, contributors, project visitors  
**Scope**: What the project does, how to get started, deployment tools
**Status**: ✅ Keep - Essential

## 📋 **OPERATIONAL DOCUMENTATION**

### 3. **DEPLOYMENT_GUIDE.md** 🚀 *DEPLOYMENT AUTHORITY*
**Purpose**: Complete deployment and operational procedures  
**Authority**: High for deployment - Definitive deployment reference  
**Audience**: DevOps, deployment engineers, system administrators  
**Scope**: Deployment wizard, TUI tools, troubleshooting, production setup

### 4. **SHELL_COMMANDS_MEMO.md** 🔧 *TECHNICAL REFERENCE*
**Purpose**: Teaching guide for shell commands and development workflows  
**Authority**: Medium - Educational and reference material  
**Audience**: Developers learning the project workflow  
**Scope**: Command explanations, development patterns, troubleshooting commands

## 📖 **SUPPORTING DOCUMENTATION**

### 5. **DOCS_HIERARCHY.md** (This file) 📚 *META DOCUMENTATION*
**Purpose**: Documentation organization and authority structure  
**Authority**: Medium - Organizational guidance  
**Audience**: Documentation maintainers, contributors  
**Scope**: Documentation standards, file purposes, hierarchy clarification

## 🎛️ **CONTENT-SPECIFIC FILES**

### Content Files (Blog/Docs)
- `content/blog/*.mdx` - Blog posts and articles
- `content/docs/*.mdx` - User documentation and guides  
**Authority**: Low-Medium - Content and user guidance  
**Audience**: End users, researchers  

## 📏 **AUTHORITY HIERARCHY**

```
1. CLAUDE.md (Technical Architecture) ⭐⭐⭐⭐⭐
2. README.md (Project Overview) ⭐⭐⭐⭐
3. DEPLOYMENT_GUIDE.md (Operations) ⭐⭐⭐⭐
4. SHELL_COMMANDS_MEMO.md (Development) ⭐⭐⭐
5. DOCS_HIERARCHY.md (Meta) ⭐⭐
6. Content Files (User Content) ⭐⭐
```

## 🧹 **IMMEDIATE CLEANUP PLAN**

### Files to Archive/Remove:
- `DASHBOARD_COMPLETION_REPORT.md` → Archive (temporary status)
- `DEPLOYMENT_STATUS_REPORT.md` → Archive (temporary status)  
- `DEVELOPMENT_MEMO.md` → Merge into CLAUDE.md or remove
- `DILEMMA_GENERATION_STATUS.md` → Archive (temporary status)
- `REPAIR_STATUS.md` → Archive (temporary status)
- `REPOSITORY_DEPLOYMENT_OVERVIEW.md` → Merge into README.md
- `SESSION_DEBRIEF.md` → Archive (temporary status)
- `SETUP_AUTH.md` → Merge into CLAUDE.md
- `SYSTEM_VALIDATION_REPORT.md` → Archive (temporary status)
- `TRIAGE.md` → Archive (temporary status)
- `VALUES.md` → Remove (confusing with project name)

### Files to Keep:
- `CLAUDE.md` ✅
- `README.md` ✅  
- `DEPLOYMENT_GUIDE.md` ✅
- `SHELL_COMMANDS_MEMO.md` ✅
- `DOCS_HIERARCHY.md` ✅ (this file)

## 🔄 **CONFLICT RESOLUTION**

When information conflicts between files:

1. **Technical Architecture**: CLAUDE.md wins
2. **Deployment Procedures**: DEPLOYMENT_GUIDE.md wins  
3. **Project Overview**: README.md wins
4. **Development Workflows**: SHELL_COMMANDS_MEMO.md wins

## ✅ **QUALITY STANDARDS**

### All Documentation Must Be:
- **Clear**: Unambiguous language and structure
- **Appropriate**: Content matches intended audience
- **Helpful**: Provides actionable information
- **Non-contradictory**: Aligns with higher authority docs
- **Complete**: Covers scope thoroughly
- **Self-validating**: Examples work as written

### Maintenance Requirements:
- Update README.md when major features change
- Update CLAUDE.md when architecture evolves  
- Update DEPLOYMENT_GUIDE.md when deployment tools change
- Keep SHELL_COMMANDS_MEMO.md current with actual commands used

## 🎯 **USAGE GUIDELINES**

**For New Contributors**:
1. Start with README.md for project understanding
2. Read CLAUDE.md for technical architecture
3. Use DEPLOYMENT_GUIDE.md for setup

**For Users**:
1. README.md for quick start
2. Content files for detailed usage
3. DEPLOYMENT_GUIDE.md for self-hosting

**For Maintainers**:
1. CLAUDE.md is the technical source of truth
2. Keep README.md current and welcoming
3. Ensure deployment tools match DEPLOYMENT_GUIDE.md

---

*This hierarchy ensures consistency, prevents contradictions, and provides clear authority for decision-making.*