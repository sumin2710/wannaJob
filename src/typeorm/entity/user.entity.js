import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'User',
  tableName: 'User',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    clientId: {
      type: 'varchar',
      nullable: true,
    },
    email: {
      type: 'varchar',
    },
    password: {
      type: 'varchar',
    },
    role: {
      type: 'varchar',
      default: 'USER',
    },
    name: {
      type: 'varchar',
    },
    age: {
      type: 'int',
      nullable: true,
    },
    gender: {
      type: 'varchar',
      nullable: true,
    },
    profileImage: {
      type: 'varchar',
      nullable: true,
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
});
