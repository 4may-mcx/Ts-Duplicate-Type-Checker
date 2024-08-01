import { DuplicateTypeMessage } from "../../../types/message";
import styled from "styled-components";

const vscode = (window as any).acquireVsCodeApi();

const Container = styled.div`
  margin-bottom: 20px;
`;

const OccurrenceContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

const FileLink = styled.span`
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
  display: inline-block;
  max-width: 100%;
  &:hover {
    text-decoration: underline;
  }
`;

export const FileLinkCell = ({
  record,
}: {
  record: DuplicateTypeMessage[number];
}) => {
  const openFileInVscode = (filePath: string) => {
    vscode.postMessage({
      command: "openFile",
      filePath,
    });
  };

  return (
    <Container>
      <div>发现重复类型: {record.typeSignature}</div>
      {record.occurrences.map((occurrence, index) => (
        <OccurrenceContainer key={index}>
          <span>{occurrence.name}: </span>
          <FileLink onClick={() => openFileInVscode(occurrence.file)}>
            {occurrence.file}
          </FileLink>
        </OccurrenceContainer>
      ))}
    </Container>
  );
};