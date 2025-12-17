export class CreatePromptDto {
  name: string;
  projectId: string; // The UUID of the project this belongs to
  template: string;
}
