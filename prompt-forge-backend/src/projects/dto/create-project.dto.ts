export class CreateProjectDto {
  name: string;
  description?: string; // The ? makes it optional, which is safer
}
