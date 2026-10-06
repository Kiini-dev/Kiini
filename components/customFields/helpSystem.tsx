/**
 * Contextual Help System for Custom Fields
 * Provides in-app help, tooltips, and guidance
 */

import React, { useState, useMemo } from 'react';
import SVGIcon from './iconSystem';

export interface HelpContent {
  id: string;
  title: string;
  shortDescription: string;
  fullContent: React.ReactNode;
  category: 'getting-started' | 'field-types' | 'validation' | 'management' | 'troubleshooting';
  relatedTopics?: string[];
  examples?: string[];
}

// Help content library
export const HELP_LIBRARY: Record<string, HelpContent> = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    shortDescription: 'Learn the basics of custom fields',
    category: 'getting-started',
    fullContent: (
      <div>
        <h3>What are Custom Fields?</h3>
        <p>
          Custom fields allow you to extend your CRM entities (Contacts, Companies, Leads, etc.)
          with additional data fields tailored to your business needs.
        </p>
        <h4>Quick Start Steps:</h4>
        <ol>
          <li>Select entity type (Contact, Company, Lead, etc.)</li>
          <li>Click "Add Custom Field" button</li>
          <li>Choose field type (Text, Number, Date, etc.)</li>
          <li>Configure field settings and validation</li>
          <li>Save and use in forms</li>
        </ol>
        <h4>Tips:</h4>
        <ul>
          <li>Use descriptive field names (e.g., "marketing_segment" not "ms")</li>
          <li>Add helpful descriptions for field labels</li>
          <li>Set validation rules to ensure data quality</li>
          <li>Consider using select fields for predefined options</li>
        </ul>
      </div>
    ),
    relatedTopics: ['field-types', 'validation', 'management'],
  },

  'field-types': {
    id: 'field-types',
    title: 'Field Types Reference',
    shortDescription: 'Understand different field types available',
    category: 'field-types',
    fullContent: (
      <div>
        <h3>Available Field Types</h3>

        <h4>Text</h4>
        <p>Single line text input. Perfect for names, codes, addresses.</p>
        <ul>
          <li>Max length: 255 characters</li>
          <li>Options: min/max length, pattern matching</li>
        </ul>

        <h4>Number</h4>
        <p>Numeric values with optional decimal places.</p>
        <ul>
          <li>Options: min value, max value, decimal places</li>
          <li>Useful for quantities, counts, amounts</li>
        </ul>

        <h4>Currency</h4>
        <p>Monetary amounts with currency symbol and formatting.</p>
        <ul>
          <li>Automatic currency symbol display</li>
          <li>Proper number formatting (thousands separator, decimals)</li>
        </ul>

        <h4>Date</h4>
        <p>Calendar date picker.</p>
        <ul>
          <li>Options: min date, max date</li>
          <li>Formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD</li>
        </ul>

        <h4>Select</h4>
        <p>Dropdown list with predefined options (single selection).</p>
        <ul>
          <li>Limited options: up to 100 items</li>
          <li>Case-insensitive duplicate detection</li>
        </ul>

        <h4>Multi-Select</h4>
        <p>Dropdown with multiple selection capability.</p>
        <ul>
          <li>Same constraints as Select</li>
          <li>Store multiple values separated by commas</li>
        </ul>

        <h4>Checkbox</h4>
        <p>Boolean true/false field.</p>
        <ul>
          <li>Perfect for yes/no questions</li>
          <li>Stored as true/false or 0/1</li>
        </ul>

        <h4>Email</h4>
        <p>Email address with format validation.</p>
        <ul>
          <li>Automatic email format validation</li>
          <li>Case-insensitive storage</li>
        </ul>

        <h4>Phone</h4>
        <p>Phone number with flexible format support.</p>
        <ul>
          <li>Supports international formats</li>
          <li>Stores raw digits only</li>
        </ul>

        <h4>File</h4>
        <p>File upload field with type and size constraints.</p>
        <ul>
          <li>Allowed MIME types (e.g., .pdf, .doc, .xls)</li>
          <li>Max file size constraint</li>
          <li>Max number of files allowed</li>
        </ul>

        <h4>Rich Text</h4>
        <p>Formatted text with HTML support (WYSIWYG editor).</p>
        <ul>
          <li>Bold, italic, underline formatting</li>
          <li>Lists, quotes, links</li>
        </ul>

        <h4>JSON</h4>
        <p>Complex structured data as JSON.</p>
        <ul>
          <li>For advanced users</li>
          <li>Validates JSON structure</li>
        </ul>

        <h4>Percentage</h4>
        <p>Numeric value 0-100 with % symbol.</p>
        <ul>
          <li>Automatically constrains 0-100 range</li>
          <li>Optional decimal places</li>
        </ul>
      </div>
    ),
    relatedTopics: ['validation', 'getting-started'],
  },

  'validation': {
    id: 'validation',
    title: 'Validation & Constraints',
    shortDescription: 'Set up rules to ensure data quality',
    category: 'validation',
    fullContent: (
      <div>
        <h3>Field Validation Rules</h3>

        <h4>Required Fields</h4>
        <p>Mark fields as required to ensure user must provide a value.</p>
        <inlineCode>Enable "Required" checkbox when creating field</inlineCode>

        <h4>Text Validation</h4>
        <ul>
          <li><strong>Min Length:</strong> Minimum number of characters required</li>
          <li><strong>Max Length:</strong> Maximum number of characters allowed (default 255)</li>
          <li><strong>Pattern:</strong> Regular expression for custom format validation</li>
        </ul>

        <h4>Number Validation</h4>
        <ul>
          <li><strong>Min Value:</strong> Minimum numeric value allowed</li>
          <li><strong>Max Value:</strong> Maximum numeric value allowed</li>
          <li><strong>Decimal Places:</strong> Number of digits after decimal point</li>
        </ul>

        <h4>Date Validation</h4>
        <ul>
          <li><strong>Min Date:</strong> Earliest date that can be selected</li>
          <li><strong>Max Date:</strong> Latest date that can be selected</li>
        </ul>

        <h4>File Validation</h4>
        <ul>
          <li><strong>Allowed MIME Types:</strong> Restrict to specific file types</li>
          <li><strong>Max File Size:</strong> File size limit in bytes</li>
          <li><strong>Max Files:</strong> Number of files allowed</li>
        </ul>

        <h4>Best Practices</h4>
        <ul>
          <li>Always add helpful error messages</li>
          <li>Use patterns for consistent data format</li>
          <li>Set realistic constraints</li>
          <li>Test validation rules before deployment</li>
        </ul>
      </div>
    ),
    relatedTopics: ['field-types', 'management'],
  },

  'management': {
    id: 'management',
    title: 'Managing Custom Fields',
    shortDescription: 'Create, edit, and delete custom fields',
    category: 'management',
    fullContent: (
      <div>
        <h3>Field Management Operations</h3>

        <h4>Create Field</h4>
        <ol>
          <li>Select entity type from tabs</li>
          <li>Click "Add Custom Field" button</li>
          <li>Fill in field information:
            <ul>
              <li><strong>Field Name:</strong> Unique identifier (alphanumeric + underscore)</li>
              <li><strong>Label:</strong> Display name for users</li>
              <li><strong>Type:</strong> Data type for field</li>
              <li><strong>Description:</strong> Helper text for users (optional)</li>
            </ul>
          </li>
          <li>Configure type-specific options</li>
          <li>Click "Save Field"</li>
        </ol>

        <h4>Edit Field</h4>
        <p>Click edit icon next to field in table.</p>
        <strong>Note:</strong> Field name cannot be changed after creation to prevent data loss.

        <h4>Delete Field</h4>
        <ol>
          <li>Click delete icon next to field</li>
          <li>Confirm deletion in dialog</li>
          <li><strong>Warning:</strong> Existing data will be lost</li>
        </ol>

        <h4>Bulk Operations</h4>
        <p>Select multiple fields using checkboxes to:</p>
        <ul>
          <li>Delete multiple fields at once</li>
          <li>Enable/disable fields in bulk</li>
          <li>Export configuration</li>
        </ul>

        <h4>Search & Filter</h4>
        <ul>
          <li><strong>Search:</strong> Find fields by name or label</li>
          <li><strong>Filter by Type:</strong> Show only specific field types</li>
          <li><strong>Sort:</strong> Order by name, type, or creation date</li>
        </ul>

        <h4>Tips</h4>
        <ul>
          <li>Test fields on non-critical entities first</li>
          <li>Communicate field additions to team</li>
          <li>Archive instead of delete when possible</li>
          <li>Document custom field purposes</li>
        </ul>
      </div>
    ),
    relatedTopics: ['getting-started', 'field-types'],
  },

  'troubleshooting': {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    shortDescription: 'Common issues and solutions',
    category: 'troubleshooting',
    fullContent: (
      <div>
        <h3>Common Issues & Solutions</h3>

        <h4>Field Not Appearing in Forms</h4>
        <ul>
          <li>Check if field is marked as "Active"</li>
          <li>Verify field is assigned to correct entity type</li>
          <li>Clear browser cache and refresh page</li>
          <li>Check user permissions for entity access</li>
        </ul>

        <h4>Validation Not Working</h4>
        <ul>
          <li>Ensure field is marked as "Required" if needed</li>
          <li>Check validation pattern syntax</li>
          <li>Test with simple values first</li>
          <li>Check browser console for errors</li>
        </ul>

        <h4>Duplicate Field Name Error</h4>
        <ul>
          <li>Field names must be unique within entity type</li>
          <li>Try different naming scheme (e.g., add prefix)</li>
          <li>Check if field was previously deleted</li>
        </ul>

        <h4>Permission Errors</h4>
        <ul>
          <li>Verify you have "Manage Custom Fields" permission</li>
          <li>Contact administrator if permissions missing</li>
          <li>Try logout and login again</li>
        </ul>

        <h4>Data Not Saving</h4>
        <ul>
          <li>Check network connection</li>
          <li>Verify all required fields are filled</li>
          <li>Try operation again after a few seconds</li>
          <li>Check browser console for detailed error</li>
        </ul>

        <h4>Need More Help?</h4>
        <p>Contact support team with:</p>
        <ul>
          <li>Screenshot of issue</li>
          <li>Steps to reproduce</li>
          <li>Browser and OS information</li>
        </ul>
      </div>
    ),
    relatedTopics: ['management', 'validation'],
  },
};

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help Panel - Full-featured help interface
 */
export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return Object.values(HELP_LIBRARY);

    const query = searchQuery.toLowerCase();
    return Object.values(HELP_LIBRARY).filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.shortDescription.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const currentTopic = selectedTopic ? HELP_LIBRARY[selectedTopic] : null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="help-panel-overlay"
          onClick={onClose}
          role="presentation"
        />
      )}

      {/* Panel */}
      <div className={`help-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Help and Documentation">
        {/* Header */}
        <div className="help-panel-header">
          <h2>Help & Documentation</h2>
          <button
            className="help-panel-close"
            onClick={onClose}
            aria-label="Close help panel"
            title="Close (Shift+?)"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="help-panel-body">
          {currentTopic ? (
            // Topic View
            <div className="help-topic">
              <button
                className="help-back-button"
                onClick={() => setSelectedTopic(null)}
              >
                ← Back
              </button>
              <div className="help-topic-content">
                {currentTopic.fullContent}
              </div>

              {/* Related Topics */}
              {currentTopic.relatedTopics && currentTopic.relatedTopics.length > 0 && (
                <div className="help-related-topics">
                  <h4>Related Topics</h4>
                  <div className="help-related-list">
                    {currentTopic.relatedTopics.map((topicId) => {
                      const topic = HELP_LIBRARY[topicId];
                      return (
                        <button
                          key={topicId}
                          className="help-related-link"
                          onClick={() => setSelectedTopic(topicId)}
                        >
                          {topic?.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Search View
            <div className="help-search-view">
              <div className="help-search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="help-search-input"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    className="help-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Topics List */}
              {filteredTopics.length > 0 ? (
                <div className="help-topics-list">
                  {filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      className="help-topic-card"
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <h3>{topic.title}</h3>
                      <p>{topic.shortDescription}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="help-no-results">
                  <p>No topics found for "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="help-panel-footer">
          <small>Press <kbd>Shift</kbd> + <kbd>?</kbd> to toggle help</small>
        </div>
      </div>
    </>
  );
};

/**
 * Tooltip Component
 */
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

/**
 * Help Icon - Inline help trigger
 */
export interface HelpIconProps {
  topic?: string;
  content?: React.ReactNode;
  onHelpClick?: () => void;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ topic, content, onHelpClick }) => {
  const handleClick = () => {
    if (onHelpClick) {
      onHelpClick();
    } else if (topic) {
      // Could trigger opening help panel with specific topic
      console.log('Help requested for:', topic);
    }
  };

  return (
    <Tooltip content={content || 'Click for more information'}>
      <button
        className="help-icon-button"
        onClick={handleClick}
        aria-label="Help"
        title="Click for help"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" />
        </svg>
      </button>
    </Tooltip>
  );
};

export default HelpPanel;
