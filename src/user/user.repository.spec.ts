import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  const model = {
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };
  let repository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository(model as any);
  });

  it('updates an incomplete registration and marks it complete', async () => {
    const result = { email: 'person@example.com' };
    model.findOneAndUpdate.mockResolvedValue(result);

    await expect(
      repository.updateInCompleteRegister('id-1', {
        firstName: 'Pat',
        lastName: 'Lee',
      }),
    ).resolves.toBe(result);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'id-1' },
      { firstName: 'Pat', lastName: 'Lee', hasCompleteRegister: true },
      { new: true },
    );
  });

  it('creates incomplete users', async () => {
    model.create.mockResolvedValue({ email: 'person@example.com' });

    await repository.createIncompleteUser({
      email: 'person@example.com',
      hasCompleteRegister: true,
    });
    expect(model.create).toHaveBeenCalledWith({
      email: 'person@example.com',
      hasCompleteRegister: false,
    });
  });

  it('returns a matching user or null', async () => {
    const user = { email: 'person@example.com' };
    model.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(null);

    await expect(repository.findOneByEmail(user.email)).resolves.toBe(user);
    await expect(
      repository.findOneByEmail('missing@example.com'),
    ).resolves.toBeNull();
    expect(model.findOne).toHaveBeenNthCalledWith(1, { email: user.email });
  });

  it('looks up users by id and soft-deletes users', async () => {
    model.findOne.mockResolvedValue(null);
    model.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await expect(repository.findOneById('id-1')).resolves.toBeNull();
    await expect(repository.deleteOne('id-1')).resolves.toBe(true);
    expect(model.findOne).toHaveBeenCalledWith({ _id: 'id-1' });
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'id-1' },
      { isDeleted: true },
    );
  });
});
