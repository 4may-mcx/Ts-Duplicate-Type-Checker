import * as ts from "typescript";
import * as fs from "fs";
import * as glob from "glob";
import path from "path";

// 获取所有 TypeScript 文件
function getAllTSFiles(dirPath: string): string[] {
  return glob.sync(`${dirPath}/**/*.ts`, { nodir: true });
}

// 读取和解析文件内容
function parseSourceFile(filePath: string): ts.SourceFile {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
}

// 获取文件中的类型声明
function getTypeDeclarations(sourceFile: ts.SourceFile): ts.Node[] {
  const declarations: ts.Node[] = [];

  function visitNode(node: ts.Node): void {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      declarations.push(node);
    }
    ts.forEachChild(node, visitNode);
  }

  ts.forEachChild(sourceFile, visitNode);

  return declarations;
}

// 获取和处理类型成员，同时跟踪类型引用
function getProperties(
  node: ts.TypeElement | ts.Node,
  sourceFile: ts.SourceFile,
  collectedTypes: string[] = []
): {
  properties: { [key: string]: string };
  literals: string[];
  references: string[];
} {
  const properties: { [key: string]: string } = {};
  const literals: string[] = collectedTypes;
  const references: string[] = [];

  function visitTypeNode(typeNode: ts.TypeNode | ts.Node): void {
    if (ts.isTypeLiteralNode(typeNode) || ts.isInterfaceDeclaration(typeNode)) {
      typeNode.forEachChild((child) => {
        if (
          ts.isPropertySignature(child) &&
          child.name &&
          ts.isIdentifier(child.name)
        ) {
          properties[child.name.text] = child.type ? child.type.getText() : "";
        }
      });
    } else if (
      ts.isIntersectionTypeNode(typeNode) ||
      ts.isUnionTypeNode(typeNode)
    ) {
      typeNode.types.forEach((typePart) => visitTypeNode(typePart));
    } else if (ts.isLiteralTypeNode(typeNode)) {
      literals.push(typeNode.getText());
    } else if (ts.isTypeReferenceNode(typeNode)) {
      const typeName = typeNode.typeName.getText(sourceFile);
      references.push(typeName);
    }
  }

  if (ts.isInterfaceDeclaration(node)) {
    node.members.forEach((member) => {
      if (
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name)
      ) {
        properties[member.name.text] = member.type ? member.type.getText() : "";
      }
    });
  } else if (ts.isTypeAliasDeclaration(node)) {
    visitTypeNode(node.type);
  }

  return { properties, literals, references };
}

// 比较两个对象的键和值是否相同
function compareObjects(
  obj1: { [key: string]: string },
  obj2: { [key: string]: string }
): boolean {
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  if (keys1.length !== keys2.length) return false;

  return keys1.every(
    (key, index) => key === keys2[index] && obj1[key] === obj2[key]
  );
}

// 比较两个字符串数组是否相同
function compareArrays(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = arr1.slice().sort();
  const sorted2 = arr2.slice().sort();

  return sorted1.every((value, index) => value === sorted2[index]);
}

// 辅助函数：比较属性
function compareProperties(
  props1: {
    properties: { [key: string]: string };
    literals: string[];
    references: string[];
  },
  props2: {
    properties: { [key: string]: string };
    literals: string[];
    references: string[];
  }
): boolean {
  return (
    compareObjects(props1.properties, props2.properties) &&
    compareArrays(props1.literals, props2.literals) &&
    compareArrays(props1.references, props2.references)
  );
}

// 查找重复类型
function findDuplicateTypes(dirPath: string) {
  const files = getAllTSFiles(dirPath);
  const typeDeclarations: {
    [key in string]: {
      file: string;
      node: ts.Node;
      properties: {
        properties: { [key: string]: string };
        literals: string[];
        references: string[];
      };
    }[];
  } = {};

  files.forEach((file) => {
    const sourceFile = parseSourceFile(file);
    const declarations = getTypeDeclarations(sourceFile);
    declarations.forEach((node) => {
      const properties = getProperties(node, sourceFile);
      if (
        Object.keys(properties.properties).length > 0 ||
        properties.literals.length > 0 ||
        properties.references.length > 0
      ) {
        const nodeName = (node as ts.DeclarationStatement).name!.getText();
        const matched = Object.values(typeDeclarations).find((value) =>
          value.some((v) => compareProperties(v.properties, properties))
        );

        if (matched) {
          matched.push({ file, node, properties });
        } else {
          if (!typeDeclarations[nodeName]) {
            typeDeclarations[nodeName] = [];
          }
          typeDeclarations[nodeName].push({ file, node, properties });
        }
      }
    });
  });

  const duplicates: {
    typeSignature: string;
    occurrences: { file: string; name: string }[];
  }[] = [];

  Object.values(typeDeclarations).forEach((details) => {
    if (details.length > 1) {
      const typeSignature = details
        .flatMap((d) => (d.node as ts.DeclarationStatement).name!.getText())
        .join(", ");

      duplicates.push({
        typeSignature,
        occurrences: details.map((detail) => ({
          file: detail.file,
          name: (detail.node as ts.DeclarationStatement).name!.getText(),
        })),
      });
    }
  });

  return duplicates;
}

export default function () {
  const targetDir = path.join(
    path.dirname(__dirname),
    "src/type-checker/test-types"
  ); // todo@xmc: 不要写死

  const duplicates = findDuplicateTypes(targetDir);

  if (duplicates.length > 0) {
    duplicates.forEach((duplicate) => {
      console.log(`发现重复类型: ${duplicate.typeSignature}`);
      duplicate.occurrences.forEach((occurrence) => {
        console.log(`  文件: ${occurrence.file}, 类型名: ${occurrence.name}`);
      });
    });
  } else {
    console.log("未发现重复的类型");
  }
}
