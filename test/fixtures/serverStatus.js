module.exports = {
  host: 'Lucass-MacBook-Air.local',
  version: '2.5.6-pre-',
  process: 'mongod',
  pid: {
    $numberLong: '67843'
  },
  uptime: 4728,
  uptimeMillis: {
    $numberLong: '4727482'
  },
  uptimeEstimate: 4393,
  localTime: {
    $date: '2014-02-15T13:20:27.250-0500'
  },
  asserts: {
    regular: 0,
    warning: 0,
    msg: 0,
    user: 0,
    rollovers: 0
  },
  backgroundFlushing: {
    flushes: 78,
    total_ms: 261,
    average_ms: 3.346153846153846,
    last_ms: 3,
    last_finished: {
      $date: '2014-02-15T13:19:39.725-0500'
    }
  },
  connections: {
    current: 0,
    available: 3891,
    totalCreated: {
      $numberLong: '14'
    }
  },
  cursors: {
    note: 'deprecated, use server status metrics',
    clientCursors_size: 0,
    totalOpen: 0,
    pinned: 0,
    totalNoTimeout: 0,
    timedOut: 0
  },
  dur: {
    commits: 29,
    journaledMB: 0,
    writeToDataFilesMB: 0,
    compression: 0,
    commitsInWriteLock: 0,
    earlyCommits: 0,
    timeMs: {
      dt: 3019,
      prepLogBuffer: 0,
      writeToJournal: 0,
      writeToDataFiles: 0,
      remapPrivateView: 0
    }
  },
  extra_info: {
    note: 'fields vary by platform',
    page_faults: 111
  },
  globalLock: {
    totalTime: {
      $numberLong: '4727482000'
    },
    lockTime: {
      $numberLong: '125291'
    },
    currentQueue: {
      total: 0,
      readers: 0,
      writers: 0
    },
    activeClients: {
      total: 0,
      readers: 0,
      writers: 0
    }
  },
  indexCounters: {
    accesses: 2,
    hits: 2,
    misses: 0,
    resets: 0,
    missRatio: 0
  },
  locks: {
      ':': {
        timeLockedMicros: {
          R: {
            $numberLong: '340081'
          },
          W: {
            $numberLong: '125291'
          }
        },
        timeAcquiringMicros: {
          R: {
            $numberLong: '191627'
          },
          W: {
            $numberLong: '27029'
          }
        }
    },
    admin: {
      timeLockedMicros: {
        r: {
          $numberLong: '4531'
        },
        w: {
          $numberLong: '0'
        }
      },
      timeAcquiringMicros: {
        r: {
          $numberLong: '244'
        },
        w: {
          $numberLong: '0'
        }
      }
    },
    local: {
      timeLockedMicros: {
        r: {
          $numberLong: '51373'
        },
        w: {
          $numberLong: '52'
        }
      },
      timeAcquiringMicros: {
        r: {
          $numberLong: '16551'
        },
        w: {
          $numberLong: '6'
        }
      }
    },
    mongomin: {
      timeLockedMicros: {
        r: {
          $numberLong: '28573'
        },
        w: {
          $numberLong: '53'
        }
      },
      timeAcquiringMicros: {
        r: {
          $numberLong: '8724'
        },
        w: {
          $numberLong: '3'
        }
      }
    }
  },
  network: {
    bytesIn: 0,
    bytesOut: 0,
    numRequests: 0
  },
  opcounters: {
    insert: 1,
    query: 235,
    update: 0,
    'delete': 0,
    getmore: 0,
    command: 9
  },
  opcountersRepl: {
    insert: 0,
    query: 0,
    update: 0,
    'delete': 0,
    getmore: 0,
    command: 0
  },
  recordStats: {
    accessesNotInMemory: 0,
    pageFaultExceptionsThrown: 0,
    admin: {
      accessesNotInMemory: 0,
      pageFaultExceptionsThrown: 0
    },
    local: {
      accessesNotInMemory: 0,
      pageFaultExceptionsThrown: 0
    },
    mongomin: {
      accessesNotInMemory: 0,
      pageFaultExceptionsThrown: 0
    }
  },
  writeBacksQueued: false,
  mem: {
    bits: 64,
    resident: 52,
    virtual: 2809,
    supported: true,
    mapped: 160,
    mappedWithJournal: 320
  },
  metrics: {
    cursor: {
      timedOut: {
        $numberLong: '0'
      },
      open: {
        noTimeout: {
          $numberLong: '0'
        },
        pinned: {
          $numberLong: '0'
        },
        total: {
          $numberLong: '0'
        }
      }
    },
    document: {
      deleted: {
        $numberLong: '0'
      },
      inserted: {
        $numberLong: '1'
      },
      returned: {
        $numberLong: '0'
      },
      updated: {
        $numberLong: '0'
      }
    },
    getLastError: {
      wtime: {
        num: 0,
        totalMillis: 0
      },
      wtimeouts: {
        $numberLong: '0'
      }
    },
    operation: {
      fastmod: {
        $numberLong: '0'
      },
      idhack: {
        $numberLong: '0'
      },
      scanAndOrder: {
        $numberLong: '0'
      }
    },
    queryExecutor: {
      scanned: {
        $numberLong: '0'
      }
    },
    record: {
      moves: {
        $numberLong: '0'
      }
    },
    repl: {
      apply: {
        batches: {
          num: 0,
          totalMillis: 0
        },
        ops: {
          $numberLong: '0'
        }
      },
      buffer: {
        count: {
          $numberLong: '0'
        },
        maxSizeBytes: 268435456,
        sizeBytes: {
          $numberLong: '0'
        }
      },
      network: {
        bytes: {
          $numberLong: '0'
        },
        getmores: {
          num: 0,
          totalMillis: 0
        },
        ops: {
          $numberLong: '0'
        },
        readersCreated: {
          $numberLong: '0'
        }
      },
      preload: {
        docs: {
          num: 0,
          totalMillis: 0
        },
        indexes: {
          num: 0,
          totalMillis: 0
        }
      }
    },
    storage: {
      freelist: {
        search: {
          bucketExhausted: {
            $numberLong: '0'
          },
          requests: {
            $numberLong: '0'
          },
          scanned: {
            $numberLong: '0'
          }
        }
      }
    },
    ttl: {
      deletedDocuments: {
        $numberLong: '0'
      },
      passes: {
        $numberLong: '78'
      }
    }
  },
  ok: 1
};
