import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const mockFiles = [
  {
    _id: '1',
    originalName: 'report.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 102400,
    uploadedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    _id: '2',
    originalName: 'photo.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 204800,
    uploadedAt: '2026-06-02T00:00:00.000Z',
  },
  {
    _id: '3',
    originalName: 'video.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 1048576,
    uploadedAt: '2026-06-03T00:00:00.000Z',
  },
];

const mockPagination = { page: 1, limit: 12, total: 3, totalPages: 1, hasMore: false };

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../../../api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

import MyFiles from '../MyFiles';

function renderMyFiles() {
  return render(
    <BrowserRouter>
      <MyFiles />
    </BrowserRouter>,
  );
}

describe('MyFiles Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url) => {
      if (url.includes('/folders')) {return Promise.resolve({ data: { folders: [] } });}
      if (url.includes('/files'))
        {return Promise.resolve({ data: { files: mockFiles, pagination: mockPagination } });}
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders file list', async () => {
    renderMyFiles();
    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
      expect(screen.getByText('video.mp4')).toBeInTheDocument();
    });
  });

  it('filters files by search query', async () => {
    renderMyFiles();
    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText('Search files...');
    await userEvent.type(searchInput, 'photo');
    await waitFor(() => {
      expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    });
  });

  it('filter tabs switch active filter', async () => {
    renderMyFiles();
    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Images'));
    await waitFor(() => {
      expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
      expect(screen.queryByText('video.mp4')).not.toBeInTheDocument();
    });
  });

  it('shows "No files found" when no matches', async () => {
    mockGet.mockImplementation((url) => {
      if (url.includes('/folders')) {return Promise.resolve({ data: { folders: [] } });}
      if (url.includes('/files'))
        {return Promise.resolve({
          data: { files: [], pagination: { page: 1, total: 0, totalPages: 0, hasMore: false } },
        });}
      return Promise.reject(new Error('Unknown URL'));
    });
    renderMyFiles();
    await waitFor(() => {
      expect(screen.getByText('No files found')).toBeInTheDocument();
    });
  });

  it('has new folder button', () => {
    renderMyFiles();
    expect(screen.getByText('+ New Folder')).toBeInTheDocument();
  });

  it('shows new folder form on button click', async () => {
    renderMyFiles();
    await userEvent.click(screen.getByText('+ New Folder'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument();
    });
  });

  it('renders filter tabs', () => {
    renderMyFiles();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Others')).toBeInTheDocument();
  });
});
