import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('../../../api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

import Upload from '../Upload';

describe('Upload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { folders: [] } });
    mockPost.mockResolvedValue({ data: {} });
  });

  it('renders dropzone', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Upload File/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Files/i)).toBeInTheDocument();
  });

  it('rejects dangerous .exe files', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(file, 'size', { value: 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByText(/not allowed for security reasons/i)).toBeInTheDocument();
    });
  });

  it('rejects .bat files', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'script.bat');
    Object.defineProperty(file, 'size', { value: 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByText(/not allowed for security reasons/i)).toBeInTheDocument();
    });
  });

  it('rejects .sh files', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'script.sh');
    Object.defineProperty(file, 'size', { value: 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByText(/not allowed for security reasons/i)).toBeInTheDocument();
    });
  });

  it('rejects files over 500MB', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'large.mp4');
    Object.defineProperty(file, 'size', { value: 600 * 1024 * 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    });
  });

  it('accepts valid files and shows file name', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'document.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 50 * 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  it('shows upload button for valid file', async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
    });
  });

  it('shows success after upload', async () => {
    mockPost.mockImplementation((url, data, config) => {
      if (config?.onUploadProgress) {
        config.onUploadProgress({ loaded: 100, total: 100 });
      }
      return Promise.resolve({ data: {} });
    });
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );
    const file = new File(['x'], 'notes.txt');
    Object.defineProperty(file, 'size', { value: 100 });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /upload file/i }));
    await waitFor(() => {
      expect(screen.getByText(/File uploaded successfully/i)).toBeInTheDocument();
    });
  });
});
