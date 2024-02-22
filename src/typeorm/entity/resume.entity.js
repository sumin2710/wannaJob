import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Resume',
  tableName: 'Resume',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    userId: {
      type: 'int',
    },
    title: {
      type: 'varchar',
    },
    introduction: {
      type: 'text',
      nullable: true,
    },
    hobby: {
      type: 'varchar',
      nullable: true,
    },
    status: {
      type: 'varchar',
      default: 'APPLY',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP(6)',
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
      default: () => 'CURRENT_TIMESTAMP(6)',
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinTable: true,
      joinColumn: { name: 'userId' },
      cascade: true,
    },
  },
});
