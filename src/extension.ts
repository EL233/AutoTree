import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/** 简单 i18n：根据 vscode.env.language 选择中/英文本 */
function localeIsChinese(): boolean {
  const lang = vscode.env.language || '';
  return lang.toLowerCase().startsWith('zh');
}

const i18n = {
  en: {
    noWorkspace: 'No workspace folder found. Open a folder first.',
    chooseConfig: 'Detected existing settings. Use them or manual setup?',
    multipleConfigs: 'Multiple configuration sources detected. Which one to use?',
    useWorkspace: 'Use Workspace Settings',
    useUser: 'Use User Settings',
    manualSetup: 'Manual setup (one-time)',
    usePreset: 'Use existing settings',
    enterIgnore: 'Enter files/folders to ignore (comma separated). Default: node_modules,.git',
    enterDepth: 'Enter recursion depth (positive integer). Leave empty or 0 for unlimited.',
    invalidDepthStrict: 'Invalid input. Please enter a positive integer (no decimals, no signs).',
    depthAdjustedToMax: (n: number) => `Input depth exceeds project max file depth. Using project max = ${n}.`,
    enterOutput: 'Enter output file name (default: PROJECT_TREE.md)',
    generated: (f: string) => `Project tree generated: ${f}`,
    errorWrite: 'Failed to write output file:',
    chooseOptionPlaceholder: 'Choose an option',
    inputCancelled: 'Input cancelled, operation aborted.',
    configInfo: (source: string, ignore: string, depth: string, output: string) => 
      `${source}:\nIgnore: ${ignore}\nDepth: ${depth}\nOutput: ${output}`
  },
  zh: {
    noWorkspace: '未检测到工作区文件夹，请先打开一个文件夹。',
    chooseConfig: '检测到已有配置，使用已有设置还是手动设置一次？',
    multipleConfigs: '检测到多处配置，请选择使用哪个配置：',
    useWorkspace: '使用工作区设置（项目配置）',
    useUser: '使用用户设置（VS Code 全局配置）',
    manualSetup: '手动设置（一次性）',
    usePreset: '使用已有设置',
    enterIgnore: '请输入要忽略的文件或文件夹（用英文逗号分隔）。默认：node_modules,.git',
    enterDepth: '请输入递归深度（正整数）。留空或 0 表示无限递归。',
    invalidDepthStrict: '输入不合法。请输入正整数（不接受小数、正负号或其他字符）。',
    depthAdjustedToMax: (n: number) => `输入深度超过项目最大文件层级，已使用项目最大层级 = ${n}。`,
    enterOutput: '请输入输出文件名（默认：PROJECT_TREE.md）',
    generated: (f: string) => `项目结构已生成：${f}`,
    errorWrite: '写入输出文件失败：',
    chooseOptionPlaceholder: '请选择一个选项',
    inputCancelled: '已取消输入，操作中止。',
    configInfo: (source: string, ignore: string, depth: string, output: string) => 
      `${source}：\n忽略项: ${ignore}\n深度: ${depth}\n输出文件: ${output}`
  }
};

function t(key: keyof typeof i18n['en']): any {
  return localeIsChinese() ? (i18n.zh as any)[key] : (i18n.en as any)[key];
}

/** 配置来源类型 */
interface ConfigSource {
  ignore: string[];
  maxDepth: number | undefined;
  outputFile: string;
  source: 'workspace' | 'user' | 'default';
}

/** 获取不同来源的配置 */
function getConfigSources(): { workspace: ConfigSource; user: ConfigSource; hasMultiple: boolean } {
  const cfg = vscode.workspace.getConfiguration('autotree');
  
  // 获取工作区配置
  const workspaceIgnore = cfg.inspect<string[]>('ignore')?.workspaceValue || [];
  const workspaceMaxDepthRaw = cfg.inspect<number>('maxDepth')?.workspaceValue;
  const workspaceOutput = cfg.inspect<string>('outputFile')?.workspaceValue || '';
  
  // 获取用户配置
  const userIgnore = cfg.inspect<string[]>('ignore')?.globalValue || [];
  const userMaxDepthRaw = cfg.inspect<number>('maxDepth')?.globalValue;
  const userOutput = cfg.inspect<string>('outputFile')?.globalValue || '';
  
  // 处理工作区 maxDepth
  let workspaceMaxDepth: number | undefined = undefined;
  if (typeof workspaceMaxDepthRaw === 'number' && Number.isInteger(workspaceMaxDepthRaw) && workspaceMaxDepthRaw > 0) {
    workspaceMaxDepth = workspaceMaxDepthRaw;
  }
  
  // 处理用户 maxDepth
  let userMaxDepth: number | undefined = undefined;
  if (typeof userMaxDepthRaw === 'number' && Number.isInteger(userMaxDepthRaw) && userMaxDepthRaw > 0) {
    userMaxDepth = userMaxDepthRaw;
  }
  
  // 判断是否有多处配置
  const hasWorkspaceConfig = workspaceIgnore.length > 0 || workspaceMaxDepth !== undefined || workspaceOutput !== '';
  const hasUserConfig = userIgnore.length > 0 || userMaxDepth !== undefined || userOutput !== '';
  
  return {
    workspace: {
      ignore: workspaceIgnore.length > 0 ? workspaceIgnore : ['node_modules', '.git'],
      maxDepth: workspaceMaxDepth,
      outputFile: workspaceOutput || 'PROJECT_TREE.md',
      source: 'workspace'
    },
    user: {
      ignore: userIgnore.length > 0 ? userIgnore : ['node_modules', '.git'],
      maxDepth: userMaxDepth,
      outputFile: userOutput || 'PROJECT_TREE.md',
      source: 'user'
    },
    hasMultiple: hasWorkspaceConfig && hasUserConfig
  };
}

/** 计算项目的实际最大文件层级（文件计入深度） */
function computeProjectMaxDepth(dir: string, ignore: string[], level = 0): number {
  let maxDepth = level;
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return maxDepth;
  }

  for (const name of entries) {
    if (ignore.includes(name)){
      continue;
    } 
    const fullPath = path.join(dir, name);

    let stat: fs.Stats;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    const currentDepth = level + 1;
    if (currentDepth > maxDepth) {
      maxDepth = currentDepth;
    }

    if (stat.isDirectory()) {
      const subDepth = computeProjectMaxDepth(fullPath, ignore, currentDepth);
      if (subDepth > maxDepth) {
        maxDepth = subDepth;
      }
    }
  }
  return maxDepth;
}

/** 生成树文本（文件层级版） */
function generateTree(dir: string, ignore: string[], depth?: number, level = 0): string {
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return '';
  }

  let out = '';
  entries.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const name of entries) {
    if (ignore.includes(name)) {
      continue;
    }
    const itemPath = path.join(dir, name);

    let stat: fs.Stats;
    try {
      stat = fs.statSync(itemPath);
    } catch {
      continue;
    }

    const currentDepth = level + 1;
    if (depth !== undefined && depth > 0 && currentDepth > depth) {
      continue;
    }

    const indent = level === 0 ? '' : '│   '.repeat(level - 1) + '├── ';
    out += `${indent}${name}\n`;

    if (stat.isDirectory()) {
      out += generateTree(itemPath, ignore, depth, level + 1);
    }
  }

  return out;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('autopjtree.generate', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage(t('noWorkspace'));
      return;
    }

    const root = workspaceFolders[0].uri.fsPath;
    const configSources = getConfigSources();

    let selectedConfig: ConfigSource | null = null;

    // 如果有多处配置，让用户选择
    if (configSources.hasMultiple) {
      const workspaceInfo = t('configInfo')(
        localeIsChinese() ? '工作区配置' : 'Workspace Config',
        configSources.workspace.ignore.join(', '),
        configSources.workspace.maxDepth?.toString() || (localeIsChinese() ? '无限制' : 'unlimited'),
        configSources.workspace.outputFile
      );
      
      const userInfo = t('configInfo')(
        localeIsChinese() ? '用户配置' : 'User Config',
        configSources.user.ignore.join(', '),
        configSources.user.maxDepth?.toString() || (localeIsChinese() ? '无限制' : 'unlimited'),
        configSources.user.outputFile
      );

      const choice = await vscode.window.showQuickPick(
        [
          { label: t('useWorkspace'), description: workspaceInfo, value: 'workspace' },
          { label: t('useUser'), description: userInfo, value: 'user' },
          { label: t('manualSetup'), value: 'manual' }
        ],
        { 
          placeHolder: t('multipleConfigs'),
          matchOnDescription: true
        }
      );

      if (!choice) {
        vscode.window.showInformationMessage(t('inputCancelled'));
        return;
      }

      if (choice.value === 'workspace') {
        selectedConfig = configSources.workspace;
      } else if (choice.value === 'user') {
        selectedConfig = configSources.user;
      }
    } else {
      // 只有一处配置或没有配置
      const cfg = vscode.workspace.getConfiguration('autotree');
      const presetIgnore = cfg.get<string[]>('ignore') || [];
      const presetMaxDepthRaw = cfg.get<number>('maxDepth');
      const presetOutput = cfg.get<string>('outputFile') || 'PROJECT_TREE.md';

      let presetMaxDepth: number | undefined = undefined;
      if (typeof presetMaxDepthRaw === 'number' && Number.isInteger(presetMaxDepthRaw) && presetMaxDepthRaw > 0) {
        presetMaxDepth = presetMaxDepthRaw;
      }

      const hasPreset = (presetIgnore && presetIgnore.length > 0) || (presetMaxDepth !== undefined);

      if (hasPreset) {
        const choice = await vscode.window.showQuickPick(
          [t('usePreset') as string, t('manualSetup') as string],
          { placeHolder: t('chooseConfig') as string }
        );
        
        if (!choice) {
          vscode.window.showInformationMessage(t('inputCancelled'));
          return;
        }

        if (choice === (t('usePreset') as string)) {
          selectedConfig = {
            ignore: presetIgnore.length > 0 ? presetIgnore : ['node_modules', '.git'],
            maxDepth: presetMaxDepth,
            outputFile: presetOutput,
            source: 'default'
          };
        }
      }
    }

    let ignoreList: string[];
    let maxDepth: number | undefined;
    let outputFile: string;

    // 如果选择了预设配置
    if (selectedConfig) {
      ignoreList = selectedConfig.ignore;
      maxDepth = selectedConfig.maxDepth;
      outputFile = selectedConfig.outputFile;
    } else {
      // 手动设置
      const ignoreInput = await vscode.window.showInputBox({
        prompt: t('enterIgnore') as string,
        value: 'node_modules,.git'
      });
      if (ignoreInput === undefined) {
        vscode.window.showInformationMessage(t('inputCancelled'));
        return;
      }

      ignoreList = ignoreInput
        ? ignoreInput.split(',').map(s => s.trim()).filter(Boolean)
        : ['node_modules', '.git'];

      const projectMaxDepth = computeProjectMaxDepth(root, ignoreList);

      let validDepth = false;
      while (!validDepth) {
        const depthInput = await vscode.window.showInputBox({
          prompt: t('enterDepth') as string,
          placeHolder: '0'
        });

        if (depthInput === undefined) {
          vscode.window.showInformationMessage(t('inputCancelled'));
          return;
        }

        const trimmed = depthInput.trim();
        if (trimmed === '' || trimmed === '0') {
          maxDepth = undefined;
          validDepth = true;
          break;
        }

        if (!/^\d+$/.test(trimmed)) {
          vscode.window.showWarningMessage(t('invalidDepthStrict'));
          continue;
        }

        const parsed = parseInt(trimmed, 10);
        if (parsed > projectMaxDepth) {
          maxDepth = projectMaxDepth;
          vscode.window.showInformationMessage(t('depthAdjustedToMax')(maxDepth));
        } else {
          maxDepth = parsed;
        }
        validDepth = true;
      }

      const outInput = await vscode.window.showInputBox({
        prompt: t('enterOutput') as string,
        value: 'PROJECT_TREE.md'
      });
      if (outInput === undefined) {
        vscode.window.showInformationMessage(t('inputCancelled'));
        return;
      }
      outputFile = outInput && outInput.trim().length > 0 ? outInput.trim() : 'PROJECT_TREE.md';
    }

    // 检查 maxDepth 是否超过项目最大深度
    if (maxDepth !== undefined) {
      const projectMaxDepthCheck = computeProjectMaxDepth(root, ignoreList);
      if (maxDepth > projectMaxDepthCheck) {
        maxDepth = projectMaxDepthCheck;
        vscode.window.showInformationMessage(t('depthAdjustedToMax')(maxDepth));
      }
    }

    const treeBody = generateTree(root, ignoreList, maxDepth);
    const fullText = '```plaintext\n' + path.basename(root) + '\n' + treeBody + '```\n';
    const outPath = path.join(root, outputFile);

    try {
      fs.writeFileSync(outPath, fullText, { encoding: 'utf8' });
      vscode.window.showInformationMessage(t('generated')(outputFile));
    } catch (err) {
      vscode.window.showErrorMessage(`${t('errorWrite')} ${(err as Error).message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}