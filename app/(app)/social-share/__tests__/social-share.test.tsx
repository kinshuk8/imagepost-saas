import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialShare from '../page';
import { Toaster } from '@/components/ui/toaster';
import { useAction, useMutation } from 'convex/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.useFakeTimers();

describe('SocialShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithProviders(ui: React.ReactNode) {
    return render(
      <>
        <Toaster />
        {ui}
      </>
    );
  }

  test('shows validation error for invalid custom ratio', async () => {
    renderWithProviders(<SocialShare />);

    const toggle = screen.getByLabelText(/use custom ratio/i);
    fireEvent.click(toggle);

    const input = screen.getByLabelText(/custom ratio/i);
    await userEvent.type(input, 'abc');

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid ratio/i);
  });

  test('toggles AI background fill triggers debounced transform', async () => {
    const mockedUseAction = useAction as unknown as vi.Mock;
    const uploadMock = vi.fn().mockResolvedValue({ publicId: 'img-123' });
    const transformMock = vi.fn().mockResolvedValue({ url: 'https://example.com/preview.png' });
    mockedUseAction
      .mockImplementationOnce(() => uploadMock) // uploadImage
      .mockImplementationOnce(() => transformMock); // transformSocialImage

    const mockedUseMutation = useMutation as unknown as vi.Mock;
    mockedUseMutation.mockImplementation(() => vi.fn());

    renderWithProviders(<SocialShare />);

    // Mock FileReader
    class FR {
      onload: null | ((ev?: unknown) => void) = null;
      onerror: null | ((ev?: unknown) => void) = null;
      readAsDataURL = (_file: File) => {
        const evt = {} as unknown as ProgressEvent<FileReader>;
        if (this.onload) this.onload(evt);
      };
    }
    // @ts-expect-error - override FileReader in test environment
    global.FileReader = FR;

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/choose an image file/i) as HTMLInputElement;

    // Set the file
    await userEvent.upload(fileInput, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => expect(uploadMock).toHaveBeenCalled());

    // Initial transform after upload
    vi.runAllTimers();
    await waitFor(() => expect(transformMock).toHaveBeenCalled());

    const aiToggle = screen.getByLabelText(/ai background fill/i);
    await userEvent.click(aiToggle);

    // Debounced call after toggle
    vi.advanceTimersByTime(500);
    await waitFor(() => expect(transformMock).toHaveBeenCalledTimes(2));
  });

  test('save variant calls Convex mutation', async () => {
    const mockedUseAction = useAction as unknown as vi.Mock;
    const uploadMock = vi.fn().mockResolvedValue({ publicId: 'img-999' });
    const transformMock = vi.fn().mockResolvedValue({ url: 'https://example.com/preview.png' });
    mockedUseAction
      .mockImplementationOnce(() => uploadMock)
      .mockImplementationOnce(() => transformMock);

    const saveMock = vi.fn().mockResolvedValue('new-image-id');
    const mockedUseMutation = useMutation as unknown as vi.Mock;
    mockedUseMutation.mockImplementation(() => saveMock);

    renderWithProviders(<SocialShare />);

    // Mock FileReader
    class FR {
      onload: null | ((ev?: unknown) => void) = null;
      onerror: null | ((ev?: unknown) => void) = null;
      readAsDataURL = (_file: File) => {
        const evt = {} as unknown as ProgressEvent<FileReader>;
        if (this.onload) this.onload(evt);
      };
    }
    // @ts-expect-error - override FileReader in test environment
    global.FileReader = FR;

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/choose an image file/i) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    await userEvent.click(uploadButton);

    await waitFor(() => expect(uploadMock).toHaveBeenCalled());

    vi.runAllTimers();
    await waitFor(() => expect(transformMock).toHaveBeenCalled());

    const saveBtn = await screen.findByRole('button', { name: /save variant/i });
    await userEvent.click(saveBtn);

    await waitFor(() => expect(saveMock).toHaveBeenCalled());
  });
});
