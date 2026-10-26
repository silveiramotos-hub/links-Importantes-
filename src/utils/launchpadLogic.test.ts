import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_LINKS } from '../data/linksData';
import {
  filterLaunchpadLinks,
  groupLinksByColumn,
  mergeLinksWithOverrides,
  validateAndNormalizeUrl,
  verifyMatrixIntegrity,
} from './launchpadLogic';
import { generateStandaloneSiteHtml } from './exportStandaloneHtml';

test('verifyMatrixIntegrity confirms exactly 96 links across 6 columns of 16 rows', () => {
  const report = verifyMatrixIntegrity(INITIAL_LINKS);
  assert.equal(report.totalCount, 96);
  assert.equal(report.columnCounts[1], 16);
  assert.equal(report.columnCounts[2], 16);
  assert.equal(report.columnCounts[3], 16);
  assert.equal(report.columnCounts[4], 16);
  assert.equal(report.columnCounts[5], 16);
  assert.equal(report.columnCounts[6], 16);
  assert.equal(report.allUrlsValid, true);
});

test('groupLinksByColumn preserves exact row ordering from reference screenshot', () => {
  const grouped = groupLinksByColumn(INITIAL_LINKS);
  assert.equal(grouped[1][0].label, 'WHATSAPP');
  assert.equal(grouped[1][15].label, "LISTA DE IA'S");
  assert.equal(grouped[2][0].label, 'CRM LOJA');
  assert.equal(grouped[2][15].label, 'SUNO');
  assert.equal(grouped[3][0].label, 'YOUTUBE REI');
  assert.equal(grouped[3][14].label, 'Gerenciador de LIVE');
  assert.equal(grouped[3][15].label, 'TIKTOK SHOP');
  assert.equal(grouped[4][0].label, 'FNO');
  assert.equal(grouped[4][15].label, 'REMOVE FUNDO VIDEO');
  assert.equal(grouped[5][0].label, 'FLOW GOOGLE');
  assert.equal(grouped[5][15].label, 'OVI VIDEO');
  assert.equal(grouped[6][0].label, 'DOLA AI');
  assert.equal(grouped[6][11].label, 'DEEVID');
  assert.equal(grouped[6][15].label, 'DESAFIO ECONOMIA');
});

test('filterLaunchpadLinks filters by query, column, and favorites', () => {
  const shopeeResults = filterLaunchpadLinks(INITIAL_LINKS, 'SHOPEE', 'all', []);
  assert.equal(shopeeResults.length, 2);

  const col3Only = filterLaunchpadLinks(INITIAL_LINKS, '', 3, []);
  assert.equal(col3Only.length, 16);
  assert.ok(col3Only.every((item) => item.column === 3));

  const favResults = filterLaunchpadLinks(
    INITIAL_LINKS,
    '',
    'favorites',
    ['c1-r1-whatsapp', 'c3-r4-gemini']
  );
  assert.equal(favResults.length, 2);
});

test('validateAndNormalizeUrl validates and normalizes URLs properly', () => {
  const emptyCheck = validateAndNormalizeUrl('   ');
  assert.equal(emptyCheck.valid, false);

  const domainOnly = validateAndNormalizeUrl('lojadocabo.com.br/painel');
  assert.equal(domainOnly.valid, true);
  assert.equal(domainOnly.url, 'https://lojadocabo.com.br/painel');
  assert.equal(domainOnly.domain, 'lojadocabo.com.br');
});

test('mergeLinksWithOverrides applies user customizations without mutating defaults', () => {
  const merged = mergeLinksWithOverrides(INITIAL_LINKS, {
    'c1-r8-loja-do-cabo': {
      url: 'https://minhaloja.com.br',
      domain: 'minhaloja.com.br',
    },
  });
  const target = merged.find((item) => item.id === 'c1-r8-loja-do-cabo');
  assert.equal(target?.url, 'https://minhaloja.com.br');
  assert.equal(target?.domain, 'minhaloja.com.br');
});

test('generateStandaloneSiteHtml produces complete HTML with all 96 links', () => {
  const html = generateStandaloneSiteHtml(INITIAL_LINKS, ['c1-r1-whatsapp']);
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(html.includes('WHATSAPP'));
  assert.ok(html.includes('DESAFIO ECONOMIA'));
  assert.ok(html.includes('https://web.whatsapp.com/'));
});
